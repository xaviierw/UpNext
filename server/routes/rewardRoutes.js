import express from "express";
import mongoose from "mongoose";

import Reward from "../models/Reward.js";
import UserReward from "../models/UserReward.js";
import User from "../models/User.js";

import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

const generateRedeemCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `UPNEXT-${part(4)}-${part(4)}`;
};

// GET all rewards (booth list)
router.get("/rewards", authenticateToken, requireRole(["student"]), async (req, res) => {
  try {
    const rewards = await Reward.find({ active: true }).sort({ createdAt: 1 });
    return res.json({ success: true, rewards });
  } catch (err) {
    console.error("GET /rewards failed:", err);
    return res.status(500).json({ success: false });
  }
});

// GET current user's redeemed rewards
router.get("/rewards/me", authenticateToken, requireRole(["student"]), async (req, res) => {
  try {
    const userId = req.user.userId;

    const redeemed = await UserReward.find({ user: userId })
      .populate("reward")
      .sort({ createdAt: -1 });

    const rewards = redeemed.map((ur) => ({
      ...ur.reward.toObject(),
      redeemCode: ur.redeemCode || "",
      redeemedAt: ur.createdAt,
    }));

    return res.json({ success: true, rewards });
  } catch (err) {
    console.error("GET /rewards/me failed:", err);
    return res.status(500).json({ success: false });
  }
});

// POST redeem a reward
router.post("/rewards/:rewardId/redeem", authenticateToken, requireRole(["student"]), async (req, res) => {
  const { rewardId } = req.params;
  const userId = req.user.userId;

  try {
    if (!mongoose.Types.ObjectId.isValid(rewardId)) {
      return res.status(400).json({ success: false, message: "Invalid reward ID." });
    }

    const reward = await Reward.findById(rewardId);
    if (!reward || !reward.active) {
      return res.status(404).json({ success: false, message: "Reward not found." });
    }

    if (reward.stock === 0) {
      return res.status(400).json({ success: false, message: "Reward is out of stock." });
    }

    const redeemCode = generateRedeemCode();

    // 1) Prevent double redeem + store redeem code on first redeem
    const result = await UserReward.updateOne(
      { user: userId, reward: reward._id },
      { $setOnInsert: { user: userId, reward: reward._id, redeemCode } },
      { upsert: true }
    );

    if (result.upsertedCount === 0) {
      const existing = await UserReward.findOne({ user: userId, reward: reward._id }).select("redeemCode");
      return res.status(400).json({
        success: false,
        message: "You have already redeemed this reward.",
        redeemCode: existing?.redeemCode || "",
      });
    }

    const userUpdate = await User.updateOne(
      { _id: userId, xpBalance: { $gte: reward.costXp } },
      { $inc: { xpBalance: -reward.costXp } }
    );

    if (userUpdate.modifiedCount === 0) {
      await UserReward.deleteOne({ user: userId, reward: reward._id });

      return res.status(400).json({
        success: false,
        message: "Not enough UN Points to redeem this reward.",
      });
    }

    if (reward.stock > -1) {
      const stockUpdate = await Reward.updateOne(
        { _id: reward._id, stock: { $gt: 0 } },
        { $inc: { stock: -1 } }
      );

      if (stockUpdate.modifiedCount === 0) {
        await User.updateOne({ _id: userId }, { $inc: { xpBalance: reward.costXp } });
        await UserReward.deleteOne({ user: userId, reward: reward._id });

        return res.status(400).json({
          success: false,
          message: "Reward went out of stock. Try again.",
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: "Reward redeemed successfully.",
      redeemCode,
    });
  } catch (err) {
    console.error("Redeem reward error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while redeeming reward.",
    });
  }
});

// GET current user's redeemed rewards with voucher codes
router.get("/rewards/me/codes", authenticateToken, requireRole(["student"]), async (req, res) => {
  try {
    const userId = req.user.userId;

    const redeemed = await UserReward.find({ user: userId })
      .populate("reward", "title code costXp")
      .select("redeemCode createdAt reward")
      .sort({ createdAt: -1 });

    const rewards = redeemed.map((r) => ({
      rewardId: r.reward?._id,
      title: r.reward?.title,
      code: r.reward?.code,
      costXp: r.reward?.costXp,
      redeemCode: r.redeemCode,
      redeemedAt: r.createdAt,
    }));

    return res.json({
      success: true,
      rewards,
    });
  } catch (err) {
    console.error("GET /rewards/me/codes failed:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching reward codes.",
    });
  }
});


export default router;