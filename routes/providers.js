import express from "express";
import Doctor from "../models/Doctor.js";
import Groomer from "../models/Groomer.js";

const router = express.Router();

router.get("/doctors", async (req, res) => {
  const { category, rating, location, maxDistance } = req.query;
  const filter = { approved: true };

  if (category) filter.specialization = category;
  if (rating) filter.rating = { $gte: Number(rating) };

  if (location && maxDistance) {
    const [lng, lat] = location.split(",").map(Number);
    filter.location = {
      $nearSphere: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: Number(maxDistance),
      },
    };
  }

  const doctors = await Doctor.find(filter).populate("user", "name email");
  res.json(doctors);
});

router.get("/groomers", async (req, res) => {
  const { rating, location, maxDistance, service } = req.query;
  const filter = { approved: true };

  if (rating) filter.rating = { $gte: Number(rating) };
  if (service) filter.services = service;

  if (location && maxDistance) {
    const [lng, lat] = location.split(",").map(Number);
    filter.location = {
      $nearSphere: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: Number(maxDistance),
      },
    };
  }

  const groomers = await Groomer.find(filter).populate("user", "name email");
  res.json(groomers);
});

export default router;
