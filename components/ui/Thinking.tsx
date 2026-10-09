export function Thinking({ label = 'Thinking…' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[12px] text-fg-muted">
      <span className="flex items-center gap-[3px]" aria-hidden>
        {[0, 150, 300].map((delay) => (
          <span key={delay} className="h-1 w-1 animate-dot rounded-full bg-fg-muted" style={{ animationDelay: `${delay}ms` }} />
        ))}
      </span>
      {label}
    </span>
  );
}
