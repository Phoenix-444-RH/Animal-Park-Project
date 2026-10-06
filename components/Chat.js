'use client';
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function Chat({ roomId, currentUserId, receiverId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingState, setTypingState] = useState(null);
  const socket = useMemo(() => io(API_BASE, { transports: ["websocket"] }), []);

  useEffect(() => {
    if (!roomId || !currentUserId) return;
    socket.emit("joinRoom", { roomId, userId: currentUserId });

    socket.on("message:received", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("typing", ({ userId, isTyping }) => {
      if (userId !== currentUserId) setTypingState(isTyping ? "Typing..." : null);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, currentUserId, socket]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("message:create", {
      roomId,
      senderId: currentUserId,
      receiverId,
      bookingId: roomId,
      message: input.trim(),
    });
    setInput("");
  };

  const handleTyping = (value) => {
    setInput(value);
    socket.emit("typing", { roomId, userId: currentUserId, isTyping: value.length > 0 });
  };

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[#946206]">Live chat</p>
          <h3 className="text-xl font-semibold text-slate-900">Consult with your provider</h3>
        </div>
      </div>
      <div className="mb-4 max-h-80 space-y-3 overflow-y-auto rounded-3xl bg-slate-50 p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">No messages yet. Start the conversation.</p>
        ) : (
          messages.map((message) => (
            <div key={message._id || `${message.sender}-${message.createdAt}`} className={`rounded-3xl p-4 ${message.sender === currentUserId ? "bg-[#1c4a2e] text-white ml-auto max-w-[80%]" : "bg-white text-slate-900 border border-slate-200 max-w-[80%]"}`}>
              <p>{message.message}</p>
              <span className="mt-2 block text-[11px] text-slate-500">{new Date(message.createdAt).toLocaleTimeString()}</span>
            </div>
          ))
        )}
      </div>
      {typingState && <p className="mb-3 text-sm text-slate-500">{typingState}</p>}
      <div className="flex gap-3">
        <input
          value={input}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#1c4a2e]"
        />
        <button onClick={sendMessage} className="rounded-full bg-[#1c4a2e] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2d6e45]">
          Send
        </button>
      </div>
    </div>
  );
}
