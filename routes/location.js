import express from "express";
import Doctor from "../models/Doctor.js";
import Groomer from "../models/Groomer.js";

const router = express.Router();

router.get("/nearby", async (req, res) => {
  const { lat, lng, role, radius } = req.query;
  if (!lat || !lng || !role) {
    return res.status(400).json({ message: "lat, lng, and role are required." });
  }

  const providerModel = role === "doctor" ? Doctor : Groomer;
  const nearby = await providerModel.find({
    approved: true,
    location: {
      $nearSphere: {
        $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
        $maxDistance: Number(radius || 10000),
      },
    },
  }).limit(20);

  res.json(nearby);
});

export default router;
