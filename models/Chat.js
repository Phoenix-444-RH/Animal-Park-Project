import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  room: { type: String, required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  message: { type: String, required: true },
  type: { type: String, enum: ["text", "location", "system"], default: "text" },
  createdAt: { type: Date, default: Date.now },
});

ChatSchema.index({ room: 1, createdAt: 1 });

export default mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
