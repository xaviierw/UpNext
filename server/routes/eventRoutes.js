import express from "express";
import Event from "../models/Event.js";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";

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

export default router;
