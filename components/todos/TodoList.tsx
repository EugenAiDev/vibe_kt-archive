"use client"

import { useState } from "react"
import { useCreateTodo, useDeleteTodo, useTodos, useUpdateTodo } from "@/hooks/useTodos"
import Section from "@/components/ui/section"

type TodoItem = {
  id: string
  text: string
  isDone: boolean
  dueAt: string | null
}

export function TodoList({ pathologyId, protocolId }: { pathologyId: string; protocolId?: string }) {
  const { data, error: queryError } = useTodos({ pathologyId, protocolId })
  const create = useCreateTodo({ pathologyId, protocolId })
  const update = useUpdateTodo()
  const remove = useDeleteTodo()
  const [text, setText] = useState("")
  const [dueAt, setDueAt] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)

  return (
    <Section title="TODO" description="Задачи по патологии">
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!text.trim()) return
          create.mutate(
            { text, dueAt: dueAt || null },
            {
              onSuccess: () => {
                setActionError(null)
                setText("")
                setDueAt("")
              },
              onError: (error) =>
                setActionError(
                  error instanceof Error ? error.message : "Не удалось создать задачу",
                ),
            },
          )
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Новая задача"
          className="h-10 flex-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
        <input
          type="date"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
        <button
          type="submit"
          className="h-10 rounded-[var(--radius)] bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] shadow-[var(--shadow)]"
        >
          Добавить
        </button>
      </form>
      {actionError ? (
        <p className="mt-2 text-xs text-[var(--destructive)]">{actionError}</p>
      ) : null}
      {queryError instanceof Error ? (
        <p className="mt-2 text-xs text-[var(--destructive)]">{queryError.message}</p>
      ) : null}
      <ul className="mt-3 space-y-2">
        {data?.map((todo: TodoItem) => (
          <li
            key={todo.id}
            className="flex flex-col gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <input
                type="checkbox"
                checked={todo.isDone}
                onChange={(e) =>
                  update.mutate(
                    { id: todo.id, isDone: e.target.checked },
                    {
                      onSuccess: () => setActionError(null),
                      onError: (error) =>
                        setActionError(
                          error instanceof Error ? error.message : "Не удалось обновить задачу",
                        ),
                    },
                  )
                }
              />
              <div className="min-w-0 flex-1">
                <div
                  className={`text-sm ${todo.isDone ? "text-[var(--muted-foreground)] line-through" : "text-[var(--foreground)]"}`}
                >
                  {todo.text}
                </div>
                {todo.dueAt ? (
                  <small className="text-xs text-[var(--muted-foreground)]">
                    до {new Date(todo.dueAt).toLocaleDateString()}
                  </small>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                remove.mutate(todo.id, {
                  onSuccess: () => setActionError(null),
                  onError: (error) =>
                    setActionError(
                      error instanceof Error ? error.message : "Не удалось удалить задачу",
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
          </li>
        ))}
      </ul>
    </Section>
  )
}
