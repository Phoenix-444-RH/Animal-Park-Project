import express from "express";
import Joi from "joi";
import authMiddleware from "../middleware/auth.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const router = express.Router();

const orderSchema = Joi.object({
  products: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
    })
  ).min(1).required(),
});

router.post("/", authMiddleware, async (req, res) => {
  const { error, value } = orderSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const items = await Promise.all(
    value.products.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error("Product not found");
      return {
        product: product._id,
        quantity: item.quantity,
        unitPrice: product.price,
      };
    })
  );

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const order = await Order.create({ user: req.user.id, products: items, total, trackingCode: `AP-${Date.now()}` });

  res.status(201).json(order);
});

router.get("/", authMiddleware, async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).populate("products.product");
  res.json(orders);
});

export default router;
