import mongoose from "mongoose"

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },
    status: {
      type: String,
      default: "confirmed"
    },
    // add any other fields you need: date, seat, etc.
  },
  { timestamps: true }
)

const Booking = mongoose.model("Booking", bookingSchema)
export default Booking
