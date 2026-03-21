"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSearch } from "@/hooks/useSearch"

type PathologyResult = { id: string; title: string; subtitle: string | null; snippet: string }
type ProtocolResult = { id: string; title: string; snippet: string }

export default function SearchPageClient({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const { data, isFetching } = useSearch(query)
  const pathologies = data?.pathologies as PathologyResult[] | undefined
  const protocols = data?.protocols as ProtocolResult[] | undefined

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (query === initialQuery) return

      const next = query.trim() ? `/search?q=${encodeURIComponent(query)}` : "/search"
      router.replace(next, { scroll: false })
    }, 180)

    return () => window.clearTimeout(handle)
  }, [initialQuery, query, router])

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
          Поиск
        </div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Найти патологию или протокол
        </h1>
      </div>

      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
        <div className="flex flex-col gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Начните вводить запрос"
            className="h-11 flex-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted-foreground)]">
            <span>Ищет по заголовкам, подзаголовкам и всему тексту. Работает по фрагментам слов.</span>
            {isFetching ? <span>Поиск…</span> : null}
          </div>
        </div>
      </div>

      {query.trim().length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
            <div className="mb-3">
              <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                Патологии
              </div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Результаты</h2>
            </div>
            <ul className="grid gap-2 text-sm">
              {pathologies?.length ? (
                pathologies.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/pathologies/${item.id}`}
                      className="block rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                    >
                      <div className="font-semibold text-[var(--foreground)]">{item.title}</div>
                      {item.subtitle ? (
                        <div className="text-xs text-[var(--muted-foreground)]">
                          {item.subtitle}
                        </div>
                      ) : null}
                      <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                        {item.snippet}
                      </div>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                  Нет совпадений по патологиям.
                </li>
              )}
            </ul>
          </section>
          <section className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
            <div className="mb-3">
              <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                Протоколы
              </div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Результаты</h2>
            </div>
            <ul className="grid gap-2 text-sm">
              {protocols?.length ? (
                protocols.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/protocols/${item.id}`}
                      className="block rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                    >
                      <div className="font-semibold text-[var(--foreground)]">{item.title}</div>
                      <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                        {item.snippet}
                      </div>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                  Нет совпадений по протоколам.
                </li>
              )}
            </ul>
          </section>
        </div>
      ) : (
        <div className="rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--muted)] p-6 text-sm text-[var(--muted-foreground)]">
          Введите запрос, чтобы увидеть результаты.
        </div>
      )}
    </div>
  )
}
