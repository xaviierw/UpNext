import express from "express";
import Event from "../models/Event.js";
import User from "../models/User.js";
import EventRegistration from "../models/EventRegistration.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import mongoose from "mongoose";

const router = express.Router();

// GET all events
router.get("/events", authenticateToken, requireRole(["student"]), async (req, res) => {
  try {
    const today = new Date();
    const events = await Event.find({
        registrationDeadline: {$gte: today}
    }).sort({ registrationDeadline: 1 });

    res.json({ success: true, events });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET personalized events
router.get("/events/personalized", authenticateToken, requireRole(["student"]), async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select(
      "eventTypes eventCategories personalized"
    );
    if (!user) {
return res.status(404).json({ success: false, message: "User not found" });
    }
    const today = new Date();
    if (!user.personalized) {
      const events = await Event.find({
        registrationDeadline: { $gte: today }
      }).sort({ registrationDeadline: 1 });
      return res.json({ success: true, events });
    }
    const preferredTypes = user.eventTypes || [];
    const preferredCategories = user.eventCategories || [];
    if (!preferredTypes.length && !preferredCategories.length) {
      const events = await Event.find({
        registrationDeadline: { $gte: today }
      }).sort({ registrationDeadline: 1 });
      return res.json({ success: true, events });
    }
    const LIMIT = 8;
    const STRONG_THRESHOLD = 2;
    const allEvents = await Event.aggregate([
      {
        $match: {
          registrationDeadline: { $gte: today }
        }
      },
      {
        $addFields: {
          categoryMatchCount: {
            $size: {
              $setIntersection: [
                { $ifNull: ["$eventCategories", []] },
                preferredCategories
              ]
            }
          },
          typeMatchCount: {
            $size: {
              $setIntersection: [
                { $ifNull: ["$eventTypes", []] },
                preferredTypes
              ]
            }
          }
        }
      },
      {
        $addFields: {
          matchScore: {
            $add: [
              { $multiply: ["$categoryMatchCount", 2] },
              { $multiply: ["$typeMatchCount", 1] }
            ]
          }
        }
      },
      {
        $sort: { matchScore: -1, registrationDeadline: 1 }
      }
    ]);
    const strongEvents = allEvents.filter(e => e.matchScore >= STRONG_THRESHOLD);
    const weakEvents = allEvents.filter(e => e.matchScore > 0 && e.matchScore < STRONG_THRESHOLD);
    const selectedEvents = [...strongEvents];
    for (const e of weakEvents) {
      if (selectedEvents.length >= LIMIT) break;
      if (!selectedEvents.some(x => String(x._id) === String(e._id))) {
        selectedEvents.push(e);
      }
    }
    const events = selectedEvents.slice(0, LIMIT);
    res.json({ success: true, events });
  } catch (err) {
    console.error("Error fetching personalized events:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET events by ID
router.get("/events/:id", authenticateToken, requireRole(["student"]), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }
    return res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Error fetching event by ID: ", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retreive event",
    });
  }
});

// POST an event (to register for an event)
router.post("/events/:eventId/register", authenticateToken, requireRole(["student"]), async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.userId;

  try {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }
    // 1) Check if there is an ACTIVE registration (status 0 or 1)
    const activeRegistration = await EventRegistration.findOne({
      event: eventId,
      user: userId,
      status: { $in: [0, 1] },   // 0 = Confirmed, 1 = Attended
    });
    if (activeRegistration) {
      return res.status(400).json({
        success: false,
        message: "You have already registered for this event.",
      });
    }
    // 2) Try to take a slot (capacity will decrease by 1)
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, capacity: { $gt: 0 } },
      { $inc: { capacity: -1 } },
      { new: true }
    );
    if (!updatedEvent) {
      return res.status(400).json({
        success: false,
        message: "This event is full.",
      });
    }
    // 3) Create a new registration 
    const registration = await EventRegistration.create({
      event: eventId,
      user: userId,
      status: 0,              
      wantsEmailReminder: false,
      wantsInAppReminder: false,
      emailReminderSent: false,
      inAppReminderSent: false,
    });
    // console.log("Created registration:", registration._id); 
    return res.status(201).json({
      success: true,
      message: "Event registration successful.",
      event: updatedEvent,
      registration,
    });
  } catch (err) {
    console.error("Register event error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while registering for event.",
    });
  }
});

export default router;