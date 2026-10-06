export default function ChatInput({
  input,
  setInput,
  onSubmit,
  disabled,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(7,12,21,0.96)_0%,rgba(9,16,28,0.98)_100%)] p-3"
    >
      <div className="flex items-end gap-3 rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="relative flex-1 overflow-hidden rounded-[1.35rem] border border-white/10 bg-[linear-gradient(135deg,rgba(20,29,44,0.98)_0%,rgba(13,26,42,0.96)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_24px_rgba(4,12,24,0.18)]">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={1}
            placeholder="Ask Paws anything about Animal Park..."
            className="chatbot-scrollbar min-h-[64px] w-full resize-none bg-transparent px-5 py-4 text-base leading-7 text-white outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#44d5bd]/18"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0e1c2e] via-[#0e1c2e]/75 to-transparent" />
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="h-[64px] rounded-[1.5rem] bg-[linear-gradient(135deg,#f19b2c_0%,#ffb347_100%)] px-7 text-lg font-semibold text-[#182131] shadow-[0_20px_35px_rgba(241,155,44,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_44px_rgba(241,155,44,0.34)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send
        </button>
      </div>
    </form>
  );
}
