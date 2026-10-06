import mongoose from "mongoose";

const GroomerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  services: { type: [String], default: ["Bath & Blow Dry", "Nail Trim", "Full Grooming"] },
  rating: { type: Number, default: 4.4 },
  reviewsCount: { type: Number, default: 0 },
  priceBase: { type: Number, required: true },
  homePickup: { type: Boolean, default: true },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], index: "2dsphere" },
    city: String,
  },
  approved: { type: Boolean, default: false },
  earnings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

GroomerSchema.index({ location: "2dsphere" });
GroomerSchema.index({ rating: -1 });

export default mongoose.models.Groomer || mongoose.model("Groomer", GroomerSchema);
