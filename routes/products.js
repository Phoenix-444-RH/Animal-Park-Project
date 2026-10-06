import express from "express";
import Joi from "joi";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

const productSchema = Joi.object({
  name: Joi.string().required(),
  category: Joi.string().valid("cats", "dogs").required(),
  subcategory: Joi.string().valid("Food", "Toys", "Grooming Kits", "Accessories").required(),
  price: Joi.number().positive().required(),
  description: Joi.string().max(1200).required(),
  image: Joi.string().uri().required(),
  stock: Joi.boolean().default(true),
});

router.get("/", async (req, res) => {
  const { category, subcategory, search, minPrice, maxPrice } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (subcategory) filter.subcategory = subcategory;
  if (search) filter.name = { $regex: search, $options: "i" };
  if (minPrice || maxPrice) filter.price = {};
  if (minPrice) filter.price.$gte = Number(minPrice);
  if (maxPrice) filter.price.$lte = Number(maxPrice);

  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
});

router.post("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "doctor" && req.user.role !== "groomer") {
    return res.status(403).json({ message: "Only provider accounts may add products." });
  }

  const { error, value } = productSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const product = await Product.create({ ...value, createdBy: req.user.id });
  res.status(201).json(product);
});

export default router;
