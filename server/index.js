// server/index.js
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import "dotenv/config.js";
import User from "./models/User.js";

const app = express();
app.use(cors());
app.use(express.json());

// --- connect to MongoDB ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// --- Register ---
app.post("/api/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, username, password: hashed });
    await user.save();

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- Login ---
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ 
      token, 
      personalized: user.personalized });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- Auth middleware ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.sendStatus(403);
    req.user = payload; // { userId, email }
    next();
  });
}

// --- Protected route example ---
// --- Get current user for personalize page ---
app.get("/api/personalize", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // from jwt.sign({ userId, email })

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

app.post("/api/personalize", authenticateToken, async (req, res) => {
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


const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on ${port}`));
