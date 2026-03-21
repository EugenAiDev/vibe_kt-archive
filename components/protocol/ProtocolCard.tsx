import Link from "next/link"

export default function ProtocolCard({ item }: { item: { id: string; title: string } }) {
  return (
    <Link
      href={`/protocols/${item.id}`}
      className="group flex items-center justify-between rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:border-[var(--ring)]"
    >
      <div>
        <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
          Протокол
        </div>
        <div className="text-sm font-semibold text-[var(--foreground)]">{item.title}</div>
      </div>
      <span className="text-xs text-[var(--accent-foreground)] transition group-hover:translate-x-0.5">
        Открыть →
      </span>
    </Link>
  )
}
