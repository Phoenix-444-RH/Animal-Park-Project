import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: ["cats", "dogs"], required: true },
  subcategory: { type: String, enum: ["Food", "Toys", "Grooming Kits", "Accessories"], required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  stock: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

ProductSchema.index({ category: 1, subcategory: 1, price: 1 });
ProductSchema.index({ name: "text", description: "text" });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
