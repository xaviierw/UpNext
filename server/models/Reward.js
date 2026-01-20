import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true,
    },

    code: { 
      type: String, 
      required: true, 
      unique: true,
    },

    image: { 
      type: String, 
      default: "",
    },

    description: { 
      type: String, 
      default: "",
    },

    costXp: { 
      type: Number, 
      required: true,
    },

    stock: { 
      type: Number, 
      default: -1,
    },

    active: { 
      type: Boolean, 
      default: true,
    },

    limitPerUser: { 
      type: Number, 
      default: 1,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Reward", rewardSchema);