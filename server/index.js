import http from "http";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";
import authRoutes from "../routes/auth.js";
import productRoutes from "../routes/products.js";
import bookingRoutes from "../routes/bookings.js";
import providerRoutes from "../routes/providers.js";
import locationRoutes from "../routes/location.js";
import orderRoutes from "../routes/orders.js";
import reviewRoutes from "../routes/reviews.js";
import { initSocket } from "../socket/socket.js";

dotenv.config();

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "animalpark-dev-secret";
}

const app = express();
const port = process.env.BACKEND_PORT || 4000;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json({ limit: "12mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

const server = http.createServer(app);
const io = initSocket(server);

const mongoUri = process.env.MONGO_URI;

const connectMongo = async () => {
  let uri = mongoUri;

  if (!uri) {
    const memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    console.log("No MONGO_URI found; using in-memory MongoDB for local development.");
  }

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("MongoDB connected");
  server.listen(port, () => console.log(`Backend running on http://localhost:${port}`));
};

connectMongo().catch((error) => {
  console.error("MongoDB connection error:", error);
  process.exit(1);
});

export { io };
