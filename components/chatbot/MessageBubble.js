import QuickReplies from "./QuickReplies";

function formatTime(createdAt) {
  try {
    return new Date(createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function MessageBubble({ message, onQuickReply }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-[1.5rem] rounded-br-md bg-[linear-gradient(135deg,#f19b2c_0%,#ffb347_100%)] px-4 py-3 text-[#1f2937] shadow-[0_18px_32px_rgba(241,155,44,0.22)]">
          <div className="text-sm leading-6">{message.text}</div>
          <div className="mt-1 text-[11px] font-medium text-[#47311b]/70">{formatTime(message.createdAt)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[88%] rounded-[1.6rem] rounded-bl-md border border-white/8 bg-[linear-gradient(180deg,rgba(12,20,33,0.96)_0%,rgba(13,23,40,0.92)_100%)] px-4 py-3.5 text-white shadow-[0_18px_40px_rgba(6,14,26,0.28)]">
        {message.line1 && <div className="text-sm font-semibold text-white">{message.line1}</div>}
        {message.body?.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.body.map((line, index) => (
              <p key={`${message.id}-body-${index}`} className="text-sm leading-6 text-slate-300">
                {line}
              </p>
            ))}
          </div>
        )}
        {message.action && <p className="mt-2 text-sm font-medium text-[#78f1d0]">{message.action}</p>}
        {message.question && <p className="mt-2 text-sm text-slate-200">{message.question}</p>}
        <div className="mt-2 text-[11px] font-medium text-slate-500">{formatTime(message.createdAt)}</div>
        <QuickReplies buttons={message.buttons} onSelect={onQuickReply} />
      </div>
    </div>
  );
}
