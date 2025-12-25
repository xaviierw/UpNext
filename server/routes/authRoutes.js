import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Register (students only)
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      username,
      password: hashed,
      role: "student",
    });
    await user.save();
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login (student/organiser)
router.post("/login", async (req, res) => {
  try {
    const { email, password, portal } = req.body; 
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (portal === "student" && user.role !== "student") {
      return res.status(403).json({ message: "Not a student account" });
    }
    if (portal === "organiser" && user.role !== "organiser") {
      return res.status(403).json({ message: "Not an organiser account" });
    }
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );
    res.json({
      token,
      role: user.role,
      personalized: user.personalized,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// // Logout
// router.post("/api/logout", (req, res) => {
//   return res.status(200).json({
//     success: true,
//     message: "Logged out successfully"
//   });
// });

export default router;
