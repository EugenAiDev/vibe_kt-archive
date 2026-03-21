import Link from "next/link"

export default function PathologyCard({ item }: { item: { id: string; title: string } }) {
  return (
    <Link
      href={`/pathologies/${item.id}`}
      className="block rounded-[calc(var(--radius)+4px)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow)] transition hover:border-[var(--ring)]"
    >
      <h2 className="text-xl font-semibold text-[var(--foreground)]">{item.title}</h2>
    </Link>
  )
}
