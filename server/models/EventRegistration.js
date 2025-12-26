import mongoose from "mongoose";

const eventRegistrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    status: {
      type: Number,
      enum: [0, 1, 2],
      default: 0,
    },

    wantsEmailReminder: {
      type: Boolean,
      default: false,
    },
    wantsInAppReminder: {
      type: Boolean,
      default: false,
    },

    emailReminderSent: {
      type: Boolean,
      default: false,
    },
    inAppReminderSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } 
);

eventRegistrationSchema.index({ user: 1, event: 1, status: 1 }, { unique: true });

const EventRegistration = mongoose.model("EventRegistration", eventRegistrationSchema);

export default EventRegistration;