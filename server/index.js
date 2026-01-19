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

// --------------------
// CORS
// --------------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4000",
  "https://upnextt.xyz",
  "https://www.upnextt.xyz",
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow server-to-server / curl / health checks (no Origin header)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// IMPORTANT: allow preflight requests using the SAME cors options
app.options("*", cors(corsOptions));

// --------------------
// Middleware
// --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Static files
app.use("/images", express.static("public/images"));
app.use("/icons", express.static("public/icons"));
app.use("/public", express.static("public"));

// --------------------
// Routes
// --------------------
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", eventRoutes);
app.use("/api", notificationRoutes);
app.use("/api", organiserRoutes);
app.use("/api", achievementRoutes);

// --------------------
// Start server
// --------------------
const port = process.env.PORT || 8080;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    if (process.env.RUN_JOBS === "true") {
      startThreeDayReminderJob();
      console.log("Reminder job started");
    }

    app.listen(port, "0.0.0.0", () => {
      console.log(`API listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
