"use client"

import Link from "next/link"
import { useState } from "react"
import Section from "@/components/ui/section"
import { useAllTodos, useDeleteAnyTodo } from "@/hooks/useTodos"

type TodoInboxItem = {
  id: string
  text: string
  isDone: boolean
  dueAt: string | null
  pathology: { id: string; title: string } | null
  protocol: { id: string; title: string } | null
}

function formatSource(todo: TodoInboxItem) {
  if (todo.protocol) {
    return {
      href: `/protocols/${todo.protocol.id}`,
      label: `Источник: протокол «${todo.protocol.title}»`,
    }
  }

  if (todo.pathology) {
    return {
      href: `/pathologies/${todo.pathology.id}`,
      label: `Источник: патология «${todo.pathology.title}»`,
    }
  }

  return null
}

export default function TodosPage() {
  const { data, isLoading, isError, error } = useAllTodos()
  const remove = useDeleteAnyTodo()
  const [actionError, setActionError] = useState<string | null>(null)
  const todos = (data ?? []) as TodoInboxItem[]

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">TODO</div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Папка задач</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Все задачи в одном месте со ссылкой на источник.
        </p>
      </div>

      <Section title="Общий список" description="Новые и незавершенные задачи сверху">
        {actionError ? <p className="mb-3 text-sm text-[var(--destructive)]">{actionError}</p> : null}
        {isLoading ? (
          <p className="text-sm text-[var(--muted-foreground)]">Загрузка задач…</p>
        ) : isError ? (
          <p className="text-sm text-[var(--destructive)]">
            {error instanceof Error ? error.message : "Ошибка загрузки задач"}
          </p>
        ) : todos.length ? (
          <ul className="space-y-2">
            {todos.map((todo) => {
              const source = formatSource(todo)
              return (
                <li
                  key={todo.id}
                  className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-3"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={`text-sm ${
                            todo.isDone
                              ? "text-[var(--muted-foreground)] line-through"
                              : "text-[var(--foreground)]"
                          }`}
                        >
                          {todo.text}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            todo.isDone
                              ? "bg-[var(--muted)] text-[var(--muted-foreground)]"
                              : "bg-[var(--accent)] text-[var(--accent-foreground)]"
                          }`}
                        >
                          {todo.isDone ? "Готово" : "В работе"}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        {todo.dueAt ? (
                          <span className="text-[var(--muted-foreground)]">
                            Срок: {new Date(todo.dueAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-[var(--muted-foreground)]">Срок не указан</span>
                        )}
                        {source ? (
                          <Link href={source.href} className="font-semibold text-[var(--primary)]">
                            {source.label}
                          </Link>
                        ) : (
                          <span className="text-[var(--muted-foreground)]">Источник недоступен</span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        remove.mutate(todo.id, {
                          onSuccess: () => setActionError(null),
                          onError: (mutationError) =>
                            setActionError(
                              mutationError instanceof Error
                                ? mutationError.message
                                : "Не удалось удалить задачу",
                            ),
                        })
                      }
                      className={`rounded-[var(--radius)] px-3 py-2 text-sm font-medium ${
                        todo.isDone
                          ? "bg-[var(--destructive)] text-[var(--primary-foreground)]"
                          : "border border-[var(--border)] text-[var(--foreground)]"
                      }`}
                    >
                      {remove.isPending && remove.variables === todo.id ? "Удаление…" : "Удалить"}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">Пока задач нет.</p>
        )}
      </Section>
    </div>
  )
}
