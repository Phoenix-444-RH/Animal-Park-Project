import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Joi from "joi";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Groomer from "../models/Groomer.js";

const router = express.Router();

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("user", "doctor", "groomer").required(),
  location: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
    city: Joi.string().allow("").optional(),
  }).required(),
  specialization: Joi.string().when("role", { is: "doctor", then: Joi.required(), otherwise: Joi.forbidden() }),
  services: Joi.array().items(Joi.string()).when("role", { is: "groomer", then: Joi.required(), otherwise: Joi.forbidden() }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post("/register", async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const existing = await User.findOne({ email: value.email });
  if (existing) return res.status(409).json({ message: "Email already in use" });

  const hashedPassword = await bcrypt.hash(value.password, 12);
  const user = await User.create({
    name: value.name,
    email: value.email,
    password: hashedPassword,
    role: value.role,
    subscription: false,
    location: {
      type: "Point",
      coordinates: [value.location.lng, value.location.lat],
      city: value.location.city || "",
    },
  });

  if (value.role === "doctor") {
    await Doctor.create({
      user: user._id,
      specialization: value.specialization,
      rating: 4.5,
      priceBase: 1200,
      categories: [value.specialization],
      location: user.location,
      approved: false,
    });
  }

  if (value.role === "groomer") {
    await Groomer.create({
      user: user._id,
      services: value.services,
      rating: 4.4,
      priceBase: 800,
      homePickup: true,
      location: user.location,
      approved: false,
    });
  }

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.status(201).json({ token, user: { id: user._id, email: user.email, role: user.role, name: user.name } });
});

router.post("/login", async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const user = await User.findOne({ email: value.email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const validPassword = await bcrypt.compare(value.password, user.password);
  if (!validPassword) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token, user: { id: user._id, email: user.email, role: user.role, name: user.name } });
});

export default router;
