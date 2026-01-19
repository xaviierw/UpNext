import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    startDateTime: {
      type: Date,
      required: true,
    },

    endDateTime: {
      type: Date,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    capacity: Number,

    organiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    eventCategories: {
      type: [String],
      default: [],
    },

    eventTypes: {
      type: [String],
      default: [],
    },

    imageURL: String,

    registrationRequired: {
      type: Boolean,
      default: true,
    },

    status: {
      type: Number,
      default: 1,
    },

    contact: {
      type: String,
      required: true,
    },

    personInCharge: {
      type: String,
      required: true,
    },

    registrationDeadline: Date,
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;
