export function Thinking({ label = 'Thinking…' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-fg-muted">
      <span className="flex items-center gap-1" aria-hidden>
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-1.5 w-1.5 animate-dot rounded-full bg-brand"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
      {label}
    </span>
  );
}
