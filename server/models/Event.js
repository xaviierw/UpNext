import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    startDateTime: Date,
    endDateTime: Date,
    location: String,
    capacity: Number,
    createdBy: String,
    eventCategories: {
      type: [String],
      default: []
    },
    eventTypes: {
      type: [String],
      default: []
    },
    imageURL: String,
    registrationRequired: Boolean,
    status: Number,
    registrationDeadline: Date
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;
