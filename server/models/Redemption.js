import mongoose from "mongoose"

const redemptionSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", required: true,
    },

    reward: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Reward", required: true,
    },

    costXp: { 
      type: Number, required: true, 
    },

    status: { 
      type: String, 
      enum: ["success", "cancelled"], 
      default: "success" },
  },

  { timestamps: true }
)

redemptionSchema.index({ user: 1, reward: 1 })

export default mongoose.model("Redemption", redemptionSchema)