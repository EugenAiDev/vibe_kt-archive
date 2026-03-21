"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"

export default function AddPathologyButton({
  categoryId,
  className,
}: {
  categoryId?: string | null
  className?: string
}) {
  const { data, status } = useSession()

  if (status === "loading") return null
  if (data?.user?.role === "GUEST") return null

  const href = categoryId ? `/pathologies/new?categoryId=${categoryId}` : "/pathologies/new"

  return (
    <Link
      href={href}
      className={`inline-flex h-10 items-center rounded-[var(--radius)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow)] ${
        className ?? ""
      }`}
    >
      Добавить патологию
    </Link>
  )
}
