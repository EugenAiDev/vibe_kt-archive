"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useComments, useCreateComment, useDeleteComment } from "@/hooks/useComments"
import Section from "@/components/ui/section"

type CommentItem = {
  id: string
  text: string
  author?: { name: string | null; email: string }
  replies?: CommentItem[]
}

export function CommentsPanel({ pathologyId }: { pathologyId: string }) {
  const { data, error: queryError } = useComments(pathologyId)
  const create = useCreateComment(pathologyId)
  const remove = useDeleteComment(pathologyId)
  const { data: session } = useSession()
  const [text, setText] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)

  const role = session?.user?.role
  const email = session?.user?.email ?? null

  const canDeleteComment = (authorEmail?: string) =>
    role === "ADMIN" || (!!email && !!authorEmail && email === authorEmail)

  return (
    <Section title="Комментарии" description="Обсуждение внутри патологии">
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!text.trim()) return
          create.mutate(
            { text },
            {
              onSuccess: () => {
                setActionError(null)
                setText("")
              },
              onError: (error) =>
                setActionError(
                  error instanceof Error ? error.message : "Не удалось создать комментарий",
                ),
            },
          )
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Добавить комментарий"
          className="h-10 flex-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
        <button
          type="submit"
          className="h-10 rounded-[var(--radius)] bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] shadow-[var(--shadow)]"
        >
          {create.isPending ? "Добавляем…" : "Добавить"}
        </button>
      </form>
      {actionError ? (
        <p className="mt-2 text-xs text-[var(--destructive)]">{actionError}</p>
      ) : null}
      {queryError instanceof Error ? (
        <p className="mt-2 text-xs text-[var(--destructive)]">{queryError.message}</p>
      ) : null}

      <div className="mt-4 grid gap-3">
        {data?.map((comment: CommentItem) => (
          <div
            key={comment.id}
            className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] p-3"
          >
            <div className="text-xs text-[var(--muted-foreground)]">
              {comment.author?.name ?? comment.author?.email ?? "Автор"}
            </div>
            <p className="text-sm text-[var(--foreground)]">{comment.text}</p>
            <button
              type="button"
              className="mt-2 text-xs text-[var(--accent-foreground)]"
              onClick={() => setReplyTo(comment.id)}
            >
              Ответить
            </button>
            {canDeleteComment(comment.author?.email) ? (
              <button
                type="button"
                className="ml-3 mt-2 text-xs text-[var(--destructive)]"
                disabled={remove.isPending}
                onClick={() => {
                  remove.mutate(comment.id, {
                    onSuccess: () => setActionError(null),
                    onError: (error) =>
                      setActionError(
                        error instanceof Error
                          ? error.message
                          : "Не удалось удалить комментарий",
                      ),
                  })
                }}
              >
                {remove.isPending && remove.variables === comment.id
                  ? "Удаляем…"
                  : "Удалить"}
              </button>
            ) : null}
            {replyTo === comment.id ? (
              <form
                className="mt-2 flex flex-wrap gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!replyText.trim()) return
                  create.mutate(
                    { text: replyText, parentId: comment.id },
                    {
                      onSuccess: () => {
                        setActionError(null)
                        setReplyText("")
                        setReplyTo(null)
                      },
                      onError: (error) =>
                        setActionError(
                          error instanceof Error
                            ? error.message
                            : "Не удалось создать комментарий",
                        ),
                    },
                  )
                }}
              >
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Ответ"
                  className="h-9 flex-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
                <button
                  type="submit"
                  className="h-9 rounded-[var(--radius)] bg-[var(--accent)] px-3 text-xs font-medium text-[var(--accent-foreground)] shadow-[var(--shadow)]"
                >
                  Отправить
                </button>
              </form>
            ) : null}
            {comment.replies?.length ? (
              <div className="mt-3 space-y-2 border-l border-[var(--border)] pl-3">
                {comment.replies.map((reply) => (
                  <div key={reply.id}>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {reply.author?.name ?? reply.author?.email ?? "Автор"}
                    </div>
                    <p className="text-sm text-[var(--foreground)]">{reply.text}</p>
                    {canDeleteComment(reply.author?.email) ? (
                      <button
                        type="button"
                        className="mt-1 text-xs text-[var(--destructive)]"
                        disabled={remove.isPending}
                        onClick={() => {
                          remove.mutate(reply.id, {
                            onSuccess: () => setActionError(null),
                            onError: (error) =>
                              setActionError(
                                error instanceof Error
                                  ? error.message
                                  : "Не удалось удалить комментарий",
                              ),
                          })
                        }}
                      >
                        {remove.isPending && remove.variables === reply.id
                          ? "Удаляем…"
                          : "Удалить"}
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Section>
  )
}
