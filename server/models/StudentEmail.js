import mongoose from "mongoose";

const studentEmailSchema = new mongoose.Schema(
  {
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true 
    },

    used: { 
        type: Boolean, 
        default: false 
    },

    usedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        default: null 
    },

    usedAt: { 
        type: Date, 
        default: null 
    },
  },
  { timestamps: true, collection: "studentemail" }
);

export default mongoose.model("StudentEmail", studentEmailSchema);
