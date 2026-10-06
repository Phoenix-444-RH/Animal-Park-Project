import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, required: true },
  providerType: { type: String, enum: ["Doctor", "Groomer"], required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

ReviewSchema.index({ provider: 1, providerType: 1 });

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
