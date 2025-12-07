import express from "express";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET personalize info
router.get("/personalize", authenticateToken, async (req, res) => {
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
router.post("/personalize", authenticateToken, async (req, res) => {
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

export default router;
