export default function QuickReplies({ buttons = [], onSelect }) {
  if (!buttons.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {buttons.map((button) => (
        <button
          key={`${button.label}-${button.actionKey || button.value || "reply"}`}
          type="button"
          onClick={() => onSelect(button)}
          className="rounded-full border border-white/10 bg-white/6 px-3.5 py-2 text-xs font-medium text-white/90 transition hover:-translate-y-0.5 hover:border-[#ffb45b]/55 hover:bg-[#ff9d2e]/16 hover:text-white"
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}
