import { Server } from "socket.io";
import Chat from "../models/Chat.js";
import Booking from "../models/Booking.js";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", async ({ roomId, userId }) => {
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("presence:update", { userId, status: "joined" });
    });

    socket.on("typing", ({ roomId, userId, isTyping }) => {
      socket.to(roomId).emit("typing", { userId, isTyping });
    });

    socket.on("message:create", async ({ roomId, senderId, receiverId, bookingId, message }) => {
      const chat = await Chat.create({
        room: roomId,
        sender: senderId,
        receiver: receiverId,
        booking: bookingId,
        message,
      });
      io.to(roomId).emit("message:received", chat);
    });

    socket.on("location:update", async ({ roomId, providerId, lat, lng }) => {
      io.to(roomId).emit("tracking:update", {
        providerId,
        position: { lat, lng },
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("booking:update", async ({ bookingId, status }) => {
      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        { status },
        { new: true }
      );
      io.to(booking.chatRoom || bookingId).emit("booking:status", booking);
    });

    socket.on("disconnect", () => {
      socket.rooms.forEach((roomId) => {
        socket.broadcast.to(roomId).emit("presence:update", { status: "left" });
      });
    });
  });

  return io;
};
