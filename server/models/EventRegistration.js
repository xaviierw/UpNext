import mongoose from "mongoose";

const eventRegistrationSchema = new mongoose.Schema(
  {
    // The user who registered
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The event they registered for
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    // 0 = Registered, 1 = Attended, 2 = Cancelled
    status: {
      type: Number,
      enum: [0, 1, 2],
      default: 0,
    },

    // ---------- Reminder preferences ----------
    // What this user WANTS for this specific event
    wantsEmailReminder: {
      type: Boolean,
      default: false,   // they will opt-in on the success screen
    },
    wantsInAppReminder: {
      type: Boolean,
      default: false,
    },

    // ---------- Reminder tracking ----------
    // What has ALREADY been sent
    emailReminderSent: {
      type: Boolean,
      default: false,
    },
    inAppReminderSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // createdAt, updatedAt
);

// prevent duplicate registrations (same user + event)
eventRegistrationSchema.index({ user: 1, event: 1 }, { unique: true });

const EventRegistration = mongoose.model(
  "EventRegistration",
  eventRegistrationSchema
);

export default EventRegistration;
