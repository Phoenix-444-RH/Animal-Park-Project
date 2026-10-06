import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "bookingType" },
  bookingType: { type: String, required: true, enum: ["Doctor", "Groomer"] },
  service: { type: String, required: true },
  petName: { type: String, required: true },
  petType: { type: String, enum: ["cat", "dog"], required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: { type: [Number], index: "2dsphere" },
    address: String,
  },
  status: { type: String, enum: ["pending", "approved", "rejected", "in_transit", "completed"], default: "pending" },
  price: { type: Number, required: true },
  chatRoom: { type: String },
  createdAt: { type: Date, default: Date.now },
});

BookingSchema.index({ user: 1, provider: 1, bookingType: 1, status: 1 });
BookingSchema.index({ location: "2dsphere" });

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
