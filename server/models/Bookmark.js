import mongoose from "mongoose"

const bookmarkSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
)

bookmarkSchema.index({ user: 1, event: 1 }, { unique: true })

const Bookmark = mongoose.model("Bookmark", bookmarkSchema)

export default Bookmark
