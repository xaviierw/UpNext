import mongoose from "mongoose"
import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import uploadImage from "../services/uploadImage.js";
import Event from "../models/Event.js";
import EventRegistration from "../models/EventRegistration.js";
import Achievement from "../models/Achievement.js";
import UserAchievement from "../models/UserAchievement.js";
import User from "../models/User.js";

const router = express.Router();

// POST an event (for organiser)
router.post("/organiser/events", authenticateToken, requireRole(["organiser"]), uploadImage.single("image"), async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      startDateTime,
      endDateTime,
      registrationDeadline,
      capacity,
      registrationRequired,
      eventCategories,
      eventTypes,
      personInCharge,
      contact,
    } = req.body;

    if (!title || !description || !location || !startDateTime || !endDateTime) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (new Date(endDateTime) <= new Date(startDateTime)) {
      return res.status(400).json({ message: "End date must be after start date" });
    }
    const imageURL = req.file ? `/images/${req.file.filename}` : "";
    const event = await Event.create({
      title,
      description,
      location,
      startDateTime,
      endDateTime,
      organiser: req.user.userId,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
      capacity: capacity ? Number(capacity) : undefined,
      imageURL: imageURL,
      registrationRequired: registrationRequired === true || registrationRequired === "true",
      eventCategories: Array.isArray(eventCategories) ? eventCategories : [],
      eventTypes: Array.isArray(eventTypes) ? eventTypes : [],
      personInCharge,
      contact,
    });
    res.status(201).json({ message: "Event created successfully", event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET events created by the organiser
router.get("/organiser/events", authenticateToken, requireRole(["organiser"]), async (req, res) => {
    try {
      const events = await Event.find({organiser: req.user.userId,}).sort({ startDateTime: 1 });
      res.json({ events });
    } catch (err) {console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// GET attendance sheet for organiser's event
router.get("/organiser/events/:eventId/attendance", authenticateToken, requireRole(["organiser"]), async (req, res) => {
    try {
      const { eventId } = req.params
      const organiserId = req.user.userId
      // 1) Make sure this event belongs to the organiser
      const event = await Event.findOne({ _id: eventId, organiser: organiserId })
        .select("title startDateTime endDateTime location")

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found or you do not have access",
        })
      }

      // 2) Fetch registrations for this event
      const registrations = await EventRegistration.find({ event: eventId })
        .populate("user", "username email") 
        .sort({ createdAt: 1 })

      // 3) Attendance sheet rows
      const attendance = registrations.map((r) => ({
        registrationId: r._id,
        userId: r.user?._id || r.user,
        name: r.user?.username || "Unknown",
        email: r.user?.email || "Unknown",
        status: r.status, // your enum: 0/1/2
        wantsEmailReminder: r.wantsEmailReminder,
        wantsInAppReminder: r.wantsInAppReminder,
        registeredAt: r.createdAt,
        updatedAt: r.updatedAt,
      }))

      return res.json({
        success: true,
        event,
        total: attendance.length,
        attendance,
      })
    } catch (err) {
      console.error("Fetch attendance error:", err)
      return res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  }
)

router.post("/organiser/events/:eventId/attendance/mark-present", authenticateToken, requireRole(["organiser"]), async (req, res) => {
    try {
      const { eventId } = req.params
      const organiserId = req.user.userId
      const { registrationIds } = req.body

      if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No registrations selected",
        })
      }

      // verify organiser owns event
      const event = await Event.findOne({ _id: eventId, organiser: organiserId }).select("_id")
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found or unauthorized access",
        })
      }

      // 1) Find which registrations are being marked present (get user ids)
      const targetRegs = await EventRegistration.find({
        _id: { $in: registrationIds },
        event: eventId,
        status: { $ne: 2 }, // do not allow cancelled
      }).select("_id user status")

      if (targetRegs.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid registrations found to update",
        })
      }

      const userIds = [...new Set(targetRegs.map((r) => String(r.user)))]

      // 2) Update registrations to status = 1 (Attended)
      const updateResult = await EventRegistration.updateMany(
        {
          _id: { $in: targetRegs.map((r) => r._id) },
          event: eventId,
          status: { $ne: 2 },
        },
        { $set: { status: 1 } }
      )

      // 3) Compute attended counts per user
      const counts = await EventRegistration.aggregate([
        { $match: { user: { $in: userIds.map((id) => new mongoose.Types.ObjectId(id)) }, status: 1 } },
        { $group: { _id: "$user", attendedCount: { $sum: 1 } } },
      ])

      const attendedMap = new Map(counts.map((c) => [String(c._id), c.attendedCount]))

      // 4) Achievements to award based on attended count
      const achievementCodes = [
        { code: "FIRST_ATTEND", min: 1 },
        { code: "PROGRESS", min: 5 },
        { code: "SUMMIT", min: 10 },
      ]

      const achievements = await Achievement.find({
        code: { $in: achievementCodes.map((a) => a.code) },
      }).select("_id code xp")

      const achievementByCode = new Map(achievements.map((a) => [a.code, a]))

      // 5) For each user, upsert user achievement once, and add XP only when newly unlocked
      let newlyUnlockedTotal = 0

      for (const uid of userIds) {
        const attendedCount = attendedMap.get(uid) || 0

        for (const rule of achievementCodes) {
          if (attendedCount < rule.min) continue

          const ach = achievementByCode.get(rule.code)
          if (!ach) continue

          const result = await UserAchievement.updateOne(
            { user: uid, achievement: ach._id },
            { $setOnInsert: { user: uid, achievement: ach._id } },
            { upsert: true }
          )

          if (result.upsertedCount > 0) {
            newlyUnlockedTotal += 1
            await User.updateOne({ _id: uid }, { $inc: { xp: ach.xp } })
          }
        }
      }

      return res.json({
        success: true,
        message: "Marked present successfully",
        modifiedCount: updateResult.modifiedCount,
        newlyUnlockedAchievements: newlyUnlockedTotal,
      })
    } catch (err) {
      console.error("Mark present + achievements error:", err)
      return res.status(500).json({ success: false, message: "Server error" })
    }
  }
)

export default router;