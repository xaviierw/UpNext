import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import Event from "../models/Event.js";

const router = express.Router();

// POST an event (for organiser)
router.post("/organiser/events", authenticateToken, requireRole(["organiser"]), async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      startDateTime,
      endDateTime,
      registrationDeadline,
      capacity,
      imageURL,
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
    const event = await Event.create({
      title,
      description,
      location,
      startDateTime,
      endDateTime,
      organiser: req.user.userId,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
      capacity: capacity ? Number(capacity) : undefined,
      imageURL: imageURL || "",
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

export default router;