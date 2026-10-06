import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  specialization: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  reviewsCount: { type: Number, default: 0 },
  priceBase: { type: Number, required: true },
  categories: { type: [String], default: ["General Veterinary"] },
  bio: { type: String, default: "Experienced veterinarian for pets." },
  experience: { type: String, default: "5 yrs" },
  approved: { type: Boolean, default: false },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], index: "2dsphere" },
    city: String,
  },
  earnings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

DoctorSchema.index({ location: "2dsphere" });
DoctorSchema.index({ categories: 1 });
DoctorSchema.index({ rating: -1 });

export default mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
