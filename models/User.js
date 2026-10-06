import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "doctor", "groomer"], default: "user" },
  phone: { type: String, trim: true },
  subscription: { type: Boolean, default: false },
  subscriptionExpiresAt: { type: Date },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: { type: [Number], index: "2dsphere" },
    city: String,
  },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.index({ email: 1 });
UserSchema.index({ location: "2dsphere" });

export default mongoose.models.User || mongoose.model("User", UserSchema);
