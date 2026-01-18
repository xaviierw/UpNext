import express from "express";
import Achievement from "../models/Achievement.js";
import UserAchievement from "../models/UserAchievement.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET all achievements (master list)
router.get("/achievements", authenticateToken, requireRole(["student"]), async (req, res) => {
    try {
      const achievements = await Achievement.find().sort({ createdAt: 1 });
      return res.json({ success: true, achievements });
    } catch (err) {
      console.error("GET /achievements failed:", err);
      return res.status(500).json({ success: false });
    }
  }
);

// GET current user's earned achievements
router.get("/achievements/me", authenticateToken, requireRole(["student"]), async (req, res) => {
    try {
      const userId = req.user.userId;

      const earned = await UserAchievement.find({ user: userId })
        .populate("achievement")
        .sort({ createdAt: -1 });

      const achievements = earned.map((ua) => ua.achievement);

      return res.json({ success: true, achievements });
    } catch (err) {
      console.error("GET /achievements/me failed:", err);
      return res.status(500).json({ success: false });
    }
  }
);

export default router;