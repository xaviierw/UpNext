import express from "express";
import Event from "../models/Event.js";
import User from "../models/User.js";
import EventRegistration from "../models/EventRegistration.js";
import { authenticateToken } from "../middleware/auth.js";
import mongoose from "mongoose";

const router = express.Router();

// GET all events
router.get("/events", authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const events = await Event.find({
        registrationDeadline: {$gte: today}
    }).sort({ startDateTime: 1 });

    res.json({ success: true, events });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET personalized events
router.get("/events/personalized", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select(
      "eventTypes eventCategories personalized"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let query = {};

    const orConditions = [];
    if (user.personalized) {
      if (user.eventTypes?.length) {
        orConditions.push({ eventTypes: { $in: user.eventTypes } });
      }
      if (user.eventCategories?.length) {
        orConditions.push({ eventCategories: { $in: user.eventCategories } });
      }
      if (orConditions.length > 0) query = { $or: orConditions };
    }
    const today = new Date();

    const events = await Event.find({
        ...query,
        registrationDeadline: {$gte:today}
    }).sort({ startDateTime: 1 });

    res.json({ success: true, events });
  } catch (err) {
    console.error("Error fetching personalized events:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/events/:id", authenticateToken, async (req, res) => {
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

router.post("/events/:eventId/register", authenticateToken, async (req, res) => {
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

    // 2) Try to take a slot (capacity -1)
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

    // 3) ALWAYS create a NEW registration document
    const registration = await EventRegistration.create({
      event: eventId,
      user: userId,
      status: 0,                // Confirmed
      wantsEmailReminder: false,
      wantsInAppReminder: false,
      emailReminderSent: false,
      inAppReminderSent: false,
    });

    console.log("Created NEW registration:", registration._id);

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