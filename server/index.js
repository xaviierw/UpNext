import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config.js";
import { startThreeDayReminderJob } from "./services/reminderJob.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import organiserRoutes from "./routes/organiserRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/images", express.static("public/images"));
app.use("/public", express.static("public"));


// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    startThreeDayReminderJob();                      
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Use route modules
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", eventRoutes);
app.use("/api", notificationRoutes);
app.use("/api", organiserRoutes);
app.use("/api", achievementRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on ${port}`));