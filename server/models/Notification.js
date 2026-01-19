import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
    },

    type: {
      type: String,
      enum: ["EVENT_REMINDER", "REGISTRATION", "SYSTEM"],
      default: "EVENT_REMINDER",
    },

    title: { 
      type: String, 
      required: true,
    },

    message: { 
      type: String, 
      required: true,
    },
    
    event: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Event",
    },

    read: { 
      type: Boolean, 
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
export default mongoose.model("Notification", notificationSchema);