import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";

export default function ChatWindow({
  isOpen,
  onClose,
  messages,
  input,
  setInput,
  onSubmit,
  onQuickReply,
  isTyping,
}) {
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current || !isOpen) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isTyping, isOpen]);

  return (
    <div
      className={`fixed inset-x-3 bottom-3 top-20 z-[70] transition-all duration-300 ease-out sm:inset-x-auto sm:bottom-24 sm:right-6 sm:top-auto sm:h-[620px] sm:w-[390px] ${
        isOpen
          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-4 scale-95 opacity-0"
      }`}
      aria-hidden={!isOpen}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[1.85rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,12,22,0.95)_0%,rgba(8,15,28,0.985)_100%)] shadow-[0_24px_60px_rgba(4,12,24,0.42)] backdrop-blur-2xl">
        <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(10,18,31,0.98)_0%,rgba(12,27,46,0.92)_55%,rgba(10,49,57,0.78)_100%)] px-4 py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-[#44d5bd] shadow-[0_0_0_6px_rgba(68,213,189,0.14)]" />
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#78f1d0]">Paws</p>
              </div>
              <p className="mt-2 max-w-[280px] text-[12px] leading-5 text-slate-300">
                Your premium Animal Park assistant for shopping, bookings, tracking, and pet-care guidance.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/6 text-lg text-slate-200 transition hover:border-[#ffb45b]/35 hover:text-white"
              aria-label="Close chatbot"
            >
              x
            </button>
          </div>
        </div>

        <div
          ref={listRef}
          className="chatbot-scrollbar flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(68,213,189,0.08),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] px-4 py-4"
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} onQuickReply={onQuickReply} />
          ))}
          {isTyping && <TypingIndicator />}
        </div>

        <ChatInput input={input} setInput={setInput} onSubmit={onSubmit} disabled={isTyping} />
      </div>
    </div>
  );
}
