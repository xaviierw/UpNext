import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import EventRegistration from "../models/EventRegistration.js";
import Event from "../models/Event.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET personalize info
router.get("/personalize", authenticateToken, requireRole(["student"]), async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select(
      "email personalized username eventTypes eventCategories"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST update preferences
router.post("/personalize", authenticateToken, requireRole(["student"]), async (req, res) => {
  try {
    const userId = req.user.userId;
    const { eventTypes, eventCategories } = req.body;

    if (!Array.isArray(eventTypes) || !Array.isArray(eventCategories)) {
      return res.status(400).json({ message: "Invalid preferences format" });
    }

    if (eventTypes.length > 2 || eventCategories.length > 3) {
      return res.status(400).json({ message: "Too many preferences selected" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        personalized: true,
        eventTypes,
        eventCategories,
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Preferences saved successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", authenticateToken, requireRole(["student"]), async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("username email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user info",
    });
  }
});

router.put("/registrations/:id/preferences", authenticateToken, requireRole(["student"]), async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId; 
    const { wantsEmailReminder, wantsInAppReminder } = req.body;

    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid registration ID.",
        });
      }

      const update = {};
      if (typeof wantsEmailReminder === "boolean") {
        update.wantsEmailReminder = wantsEmailReminder;
      }
      if (typeof wantsInAppReminder === "boolean") {
        update.wantsInAppReminder = wantsInAppReminder;
      }

      if (Object.keys(update).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid preferences provided.",
        });
      }

      const updatedRegistration = await EventRegistration.findOneAndUpdate(
        { _id: id, user: userId },
        update,
        { new: true }
      );

      if (!updatedRegistration) {
        return res.status(404).json({
          success: false,
          message: "Registration not found for this user.",
        });
      }

      return res.json({
        success: true,
        message: "Reminder preferences updated.",
        registration: updatedRegistration,
      });
    } catch (err) {
      console.error("Update preferences error:", err);
      return res.status(500).json({
        success: false,
        message: "Server error while updating preferences.",
      });
    }
  }
);

router.get("/registrations/me", authenticateToken, requireRole(["student"]), async (req, res) => {
  try {
    const userId = req.user.userId;

    const registrations = await EventRegistration.find({ user: userId })
      .populate("event")              
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      registrations,
    });

  } catch (err) {
    console.error("Error fetching registrations:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch event registrations",
    });
  }
});

router.put("/registrations/:id/cancel", authenticateToken, requireRole(["student"]), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id || req.user.userId;

    const reg = await EventRegistration.findOneAndUpdate(
      { _id: id, user: userId },
      { status: 2 },
      { new: true }
    );

    if (!reg) {
      return res.status(404).json({
        success: false,
        message: "Registration not found or not yours",
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      reg.event,
      { $inc: { capacity: 1 } },
      { new: true }
    );

    res.json({
      success: true,
      registration: reg,
      updatedEvent,
    });
  } catch (err) {
    console.error("Error cancelling registration:", err);
    res.status(500).json({
      success: false,
      message: "Failed to cancel registration",
    });
  }
});

export default router;