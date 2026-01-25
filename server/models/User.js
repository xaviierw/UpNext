import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      unique: false,
      required: true,
      trim: true,
    },

    personalized: {
      type: Boolean,
      default: false
    },

    eventTypes: {
      type: [String],
      default: [],
    },

    eventCategories: {
      type: [String],
      default: [],
    },

    role: {
      type: String,
      enum: ["student", "organiser", "admin"],
      default: "student",
    },

    xp: { 
      type: Number, 
      default: 0,
    },

    xpBalance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;