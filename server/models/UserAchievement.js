import mongoose from "mongoose";

const userAchievementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    achievement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Achievement",
      required: true,
    },
  },
  { timestamps: true }
);

userAchievementSchema.index(
  { user: 1, achievement: 1 },
  { unique: true }
);

export default mongoose.model("UserAchievement", userAchievementSchema);