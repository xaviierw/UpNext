import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import leoProfanity from "leo-profanity";
import StudentEmail from "../models/StudentEmail.js";

const router = express.Router();

// POST Register (students only)
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailLower = email.toLowerCase().trim();
    const usernameLower = username.toLowerCase().trim();

    // TP student email only
    if (!/^[a-zA-Z0-9._%+-]+@student\.tp\.edu\.sg$/.test(emailLower)) {
      return res.status(400).json({ message: "Only @student.tp.edu.sg emails are allowed", });
    }

    // Allowlist check (Option B)
    const allowed = await StudentEmail.findOne({ email: emailLower });
    if (!allowed) {
      return res.status(403).json({ message: "This student email is not in the approved list", });
    }

    if (allowed.used) {
      return res.status(403).json({ message: "This student email has already been used to register", });
    }

    // Username basic format
    if (!/^[a-zA-Z0-9._]{3,20}$/.test(username)) {
      return res.status(400).json({ message:"Username must be 3–20 characters and contain only letters, numbers, dots or underscores", });
    }

    // Profanity check (normalize for simple leetspeak)
    const normalizedUsername = usernameLower
      .replace(/0/g, "o")
      .replace(/1/g, "i")
      .replace(/3/g, "e")
      .replace(/4/g, "a")
      .replace(/5/g, "s")
      .replace(/7/g, "t")
      .replace(/@/g, "a")
      .replace(/\$/g, "s");

    if (leoProfanity.check(normalizedUsername)) {
      return res.status(400).json({ message: "Username contains inappropriate language", });
    }

    // Reserved system names
    const reserved = ["admin", "support", "moderator", "staff", "system"];
    if (reserved.some(r => normalizedUsername.includes(r))) {
      return res.status(400).json({ message: "Username contains reserved terms. Cannot contain admin, support, etc.", });
    }

    // Password complexity
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters and include uppercase, lowercase, number and special character",});
    }

    // Existing user check
    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email: emailLower,
      username,
      password: hashed,
      role: "student",
    });

    // Mark allowlist email as used
    allowed.used = true;
    allowed.usedAt = new Date();
    allowed.usedBy = newUser._id;
    await allowed.save();
    return res.status(201).json({ message: "User registered" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST Login (student/organiser)
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
