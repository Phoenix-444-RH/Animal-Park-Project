export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-[1.4rem] rounded-bl-md border border-white/8 bg-[#0d1728]/85 px-4 py-3 shadow-[0_12px_30px_rgba(6,14,26,0.28)]">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#44d5bd]"
              style={{ animationDelay: `${dot * 0.12}s`, animationDuration: "0.9s" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
