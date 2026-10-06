import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useAppState } from "../../lib/app-state";
import { demoProducts } from "../../lib/animal-data";
import { detectIntent } from "../../lib/chatbot/intentEngine";
import { getChatbotResponse } from "../../lib/chatbot/responseLibrary";
import { executeChatbotAction } from "../../lib/chatbot/actionHandler";
import ChatWindow from "./ChatWindow";

const STORAGE_KEY = "animal_park_paws_widget_v4";

function buildBotMessage(payload) {
  return {
    id: `bot_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    role: "bot",
    line1: payload.line1,
    body: payload.body || [],
    action: payload.action,
    question: payload.question,
    buttons: payload.buttons || [],
    createdAt: Date.now(),
  };
}

function buildUserMessage(text) {
  return {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    role: "user",
    text,
    createdAt: Date.now(),
  };
}

function PawGlyph() {
  return (
    <svg viewBox="0 0 64 64" className="h-8 w-8" aria-hidden="true">
      <defs>
        <linearGradient id="pawGold" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffd57a" />
          <stop offset="100%" stopColor="#f19b2c" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="7" fill="url(#pawGold)" />
      <circle cx="32" cy="15" r="7" fill="url(#pawGold)" />
      <circle cx="44" cy="20" r="7" fill="url(#pawGold)" />
      <path d="M18 38c0-7.7 6.5-14 14.5-14S47 30.3 47 38c0 8.3-5.7 14-14.5 14S18 46.3 18 38Z" fill="url(#pawGold)" />
    </svg>
  );
}

export default function ChatbotWidget() {
  const router = useRouter();
  const {
    isHydrated,
    session,
    currentUser,
    cart,
    checkoutDraft,
    orders,
    groomingBookings,
    notifications,
  } = useAppState();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [fallbackCount, setFallbackCount] = useState(0);

  const context = useMemo(() => {
    const cartCount = Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.qty || 1), 0) : 0;
    const activeOrderCount = Array.isArray(orders)
      ? orders.filter((order) => order.userId === session?.id && !["Delivered", "Cancelled"].includes(order.status)).length
      : 0;
    const activeGroomingCount = Array.isArray(groomingBookings)
      ? groomingBookings.filter((booking) => {
          if (booking.userId !== session?.id) return false;
          return !["Delivered back", "Completed", "Cancelled"].includes(booking.stage || booking.status);
        }).length
      : 0;

    return {
      isLoggedIn: Boolean(session),
      userName: currentUser?.name || session?.name || "there",
      cartCount,
      hasCheckoutDraft: Boolean(checkoutDraft),
      isPremium: Boolean(currentUser?.subscription || currentUser?.premium),
      activeOrderCount,
      activeGroomingCount,
      activeNotifications: Array.isArray(notifications) ? notifications.length : 0,
      fallbackCount,
      products: demoProducts,
    };
  }, [cart, checkoutDraft, currentUser, fallbackCount, groomingBookings, notifications, orders, session]);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setMessages([buildBotMessage(getChatbotResponse("greeting", context))]);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setMessages(parsed.messages?.length ? parsed.messages : [buildBotMessage(getChatbotResponse("greeting", context))]);
    } catch {
      setMessages([buildBotMessage(getChatbotResponse("greeting", context))]);
    }
  }, [isHydrated]);

  useEffect(() => {
    if (typeof window === "undefined" || !messages.length) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages }));
  }, [messages]);

  const appendBotReply = async (payload) => {
    const message = buildBotMessage(payload);
    setMessages((prev) => [...prev, message]);
    if (payload.autoAction) {
      await executeChatbotAction({ router, action: payload.autoAction, closeWidget: () => setIsOpen(false) });
    }
  };

  const handleQuickReply = async (button) => {
    if (button?.action) {
      await executeChatbotAction({ router, action: button.action, closeWidget: () => setIsOpen(false) });
      return;
    }
    if (button?.value) submitMessage(button.value);
  };

  const submitMessage = (forcedText) => {
    const text = (forcedText ?? input).trim();
    if (!text) return;

    setInput("");
    setMessages((prev) => [...prev, buildUserMessage(text)]);
    setIsTyping(true);

    window.setTimeout(async () => {
      setIsTyping(false);
      const { intent, entities } = detectIntent(text, context);
      if (intent === "fallback") setFallbackCount((prev) => prev + 1);
      const reply = getChatbotResponse(intent, { ...context, fallbackCount: intent === "fallback" ? fallbackCount + 1 : fallbackCount }, entities);
      await appendBotReply(reply);
    }, 420);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 z-[65] flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-[#ffb45b]/35 bg-[radial-gradient(circle_at_top,#204e36_0%,#173d2e_48%,#0f2235_100%)] text-white shadow-[0_22px_45px_rgba(11,21,38,0.35)] transition hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(11,21,38,0.42)] sm:bottom-6 sm:right-6"
        aria-label="Open Paws assistant"
      >
        <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#44d5bd] shadow-[0_0_0_6px_rgba(68,213,189,0.14)]" />
        <PawGlyph />
      </button>

      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        input={input}
        setInput={setInput}
        onSubmit={(event) => {
          event.preventDefault();
          submitMessage();
        }}
        onQuickReply={handleQuickReply}
        isTyping={isTyping}
      />
    </>
  );
}
