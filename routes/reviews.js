import express from "express";
import Joi from "joi";
import authMiddleware from "../middleware/auth.js";
import Review from "../models/Review.js";

const router = express.Router();

const reviewSchema = Joi.object({
  providerId: Joi.string().required(),
  providerType: Joi.string().valid("Doctor", "Groomer").required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().max(500).required(),
});

router.post("/", authMiddleware, async (req, res) => {
  const { error, value } = reviewSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const review = await Review.create({
    user: req.user.id,
    provider: value.providerId,
    providerType: value.providerType,
    rating: value.rating,
    comment: value.comment,
  });

  res.status(201).json(review);
});

router.get("/provider/:id", async (req, res) => {
  const reviews = await Review.find({ provider: req.params.id });
  res.json(reviews);
});

export default router;
