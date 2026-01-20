import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config.js";
import { startThreeDayReminderJob } from "./services/reminderJob.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import organiserRoutes from "./routes/organiserRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";
import rewardRoutes from "./routes/rewardRoutes.js"

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4000",
  "https://upnextt.xyz",
  "https://www.upnextt.xyz",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/images", express.static("public/images"));
app.use("/icons", express.static("public/icons"));
app.use("/public", express.static("public"));

// Use route modules
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", eventRoutes);
app.use("/api", notificationRoutes);
app.use("/api", organiserRoutes);
app.use("/api", achievementRoutes);
app.use("/api", rewardRoutes);

const port = process.env.PORT || 4000;

// Connect to MongoDB once, then start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    if (process.env.RUN_JOBS === "true") {
      startThreeDayReminderJob();
      console.log("Reminder job started");
    } else {
      console.log("Reminder job disabled (RUN_JOBS !== 'true')");
    }

    app.listen(port, "0.0.0.0", () => {
      console.log(`API listening on ${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });