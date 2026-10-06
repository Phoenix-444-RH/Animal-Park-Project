import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, default: 1 },
      unitPrice: { type: Number, required: true },
    },
  ],
  total: { type: Number, required: true },
  status: { type: String, enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], default: "pending" },
  trackingCode: { type: String },
  createdAt: { type: Date, default: Date.now },
});

OrderSchema.index({ user: 1, status: 1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
