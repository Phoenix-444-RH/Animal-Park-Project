import express from "express";
import Joi from "joi";
import authMiddleware from "../middleware/auth.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Groomer from "../models/Groomer.js";

const router = express.Router();

const bookingSchema = Joi.object({
  bookingType: Joi.string().valid("doctor", "groomer").required(),
  providerId: Joi.string().required(),
  date: Joi.date().required(),
  time: Joi.string().required(),
  service: Joi.string().required(),
  petName: Joi.string().required(),
  petType: Joi.string().valid("cat", "dog").required(),
  location: Joi.object({
    address: Joi.string().required(),
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  }).required(),
});

router.post("/book", authMiddleware, async (req, res) => {
  const { error, value } = bookingSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found." });

  const provider = value.bookingType === "doctor"
    ? await Doctor.findById(value.providerId)
    : await Groomer.findById(value.providerId);
  if (!provider) return res.status(404).json({ message: "Provider not found." });

  const booking = await Booking.create({
    user: user._id,
    provider: provider._id,
    bookingType: value.bookingType,
    service: value.service,
    petName: value.petName,
    petType: value.petType,
    date: value.date,
    time: value.time,
    location: {
      type: "Point",
      coordinates: [value.location.lng, value.location.lat],
      address: value.location.address,
    },
    status: "pending",
    price: provider.priceBase * (1 + (provider.rating - 4) * 0.15) * (user.subscription ? 0.75 : 1),
  });

  res.status(201).json(booking);
});

router.get("/", authMiddleware, async (req, res) => {
  const { role, id } = req.user;
  const query = role === "user"
    ? { user: id }
    : { provider: id };

  const bookings = await Booking.find(query)
    .populate("user", "name email role")
    .populate("provider", "name rating priceBase specialization services location");

  res.json(bookings);
});

export default router;
