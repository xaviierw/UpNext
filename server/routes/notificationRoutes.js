import express from "express";
import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET and returns latest notifications + unreadCount
router.get("/notifications", authenticateToken, requireRole(["student"]), async (req, res) => {
  try {
    const userId = req.user.userId;
    const limitRaw = parseInt(req.query.limit ?? "5", 10);
    const skipRaw = parseInt(req.query.skip ?? "0", 10);
    const limit = Number.isNaN(limitRaw) ? 5 : Math.min(Math.max(limitRaw, 1), 20);
    const skip = Number.isNaN(skipRaw) ? 0 : Math.max(skipRaw, 0);
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ user: userId, read: false }),
    ]);
    return res.json({
      success: true,
      notifications,
      unreadCount,
      paging: { limit, skip, returned: notifications.length },
    });
  } catch (err) {
    console.error("GET /notifications failed:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch notifications." });
  }
});

// POST a single notification as read (mark it as read)
router.post("/notifications/:id/read", authenticateToken, requireRole(["student"]), async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid notification id." });
    }
    const result = await Notification.updateOne(
      { _id: id, user: userId, read: false },
      { $set: { read: true } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found (or already read).",
      });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("POST /notifications/:id/read failed:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to mark notification as read." });
  }
});

// POST all unread notifications as read
router.post("/notifications/read-all", authenticateToken, requireRole(["student"]), async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await Notification.updateMany(
      { user: userId, read: false },
      { $set: { read: true } }
    );
    return res.json({
      success: true,
      markedRead: result.modifiedCount,
    });
  } catch (err) {
    console.error("POST /notifications/read-all failed:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to mark all as read." });
  }
});

export default router;