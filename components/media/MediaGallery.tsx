"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useMedia, useUploadMedia, useDeleteMedia } from "@/hooks/useMedia"
import Section from "@/components/ui/section"

type MediaItem = {
  id: string
  type: "IMAGE" | "VIDEO"
  originalName: string
}

export function MediaGallery({
  pathologyId,
  protocolId,
}: {
  pathologyId?: string
  protocolId?: string
}) {
  const { data, error: queryError } = useMedia({ pathologyId, protocolId })
  const upload = useUploadMedia({ pathologyId, protocolId })
  const remove = useDeleteMedia({ pathologyId, protocolId })
  const [actionError, setActionError] = useState<string | null>(null)
  const [imageFallback, setImageFallback] = useState<Record<string, boolean>>({})
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const description = protocolId ? "Файлы протокола" : "Изображения и видео по патологии"
  const items = (data ?? []) as MediaItem[]
  const effectiveActiveIndex =
    items.length === 0 ? 0 : Math.min(activeIndex, Math.max(items.length - 1, 0))
  const active = items[effectiveActiveIndex] ?? null

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (event.key === "Escape") {
        setLightboxIndex(null)
        return
      }
      if (event.key === "ArrowRight" && items.length > 1) {
        setLightboxIndex((current) => {
          if (current === null) return current
          return (current + 1) % items.length
        })
      }
      if (event.key === "ArrowLeft" && items.length > 1) {
        setLightboxIndex((current) => {
          if (current === null) return current
          return current === 0 ? items.length - 1 : current - 1
        })
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightboxIndex, items.length])

  const errorMessage = useMemo(() => {
    if (actionError) return actionError
    if (queryError instanceof Error) return queryError.message
    return null
  }, [actionError, queryError])
  const hasQueryError = queryError instanceof Error

  const move = (direction: "prev" | "next") => {
    if (items.length <= 1) return
    setActiveIndex((current) => {
      if (direction === "next") return (current + 1) % items.length
      return current === 0 ? items.length - 1 : current - 1
    })
  }

  const activeSource =
    active?.type === "IMAGE"
      ? imageFallback[active.id]
        ? `/api/media/file/${active.id}`
        : `/api/media/file/${active.id}?variant=previewLarge`
      : null

  const lightboxItem =
    lightboxIndex !== null && lightboxIndex >= 0 && lightboxIndex < items.length
      ? items[lightboxIndex]
      : null

  return (
    <Section title="Медиа" description={description}>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          accept="image/*,video/*"
          disabled={upload.isPending}
          className="w-full text-sm file:mr-3 file:rounded-[var(--radius)] file:border file:border-[var(--border)] file:bg-[var(--secondary)] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[var(--secondary-foreground)] hover:file:bg-[var(--accent)]"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              upload.mutate(file, {
                onSuccess: () => setActionError(null),
                onError: (err) =>
                  setActionError(
                    err instanceof Error ? err.message : "Ошибка загрузки файла"
                  ),
              })
            }
            e.currentTarget.value = ""
          }}
        />
        <p className="text-xs text-[var(--muted-foreground)]">
          Поддерживаются изображения и видео. Сжатие выполняется автоматически.
        </p>
      </div>
      {errorMessage ? (
        <p className="mt-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-xs text-[var(--destructive)]">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-4">
        {items.length ? (
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] p-3 shadow-[var(--shadow)]">
              {active?.type === "IMAGE" ? (
                <button
                  type="button"
                  className="block w-full"
                  onClick={() => setLightboxIndex(effectiveActiveIndex)}
                >
                  <Image
                    src={activeSource ?? `/api/media/file/${active.id}`}
                    alt={active.originalName}
                    width={1600}
                    height={900}
                    unoptimized
                    onError={() =>
                      setImageFallback((prev) =>
                        prev[active.id] ? prev : { ...prev, [active.id]: true },
                      )
                    }
                    className="h-[300px] w-full rounded-[calc(var(--radius)-4px)] border border-[var(--border)] object-contain"
                  />
                </button>
              ) : (
                <video
                  controls
                  poster={`/api/media/file/${active.id}?variant=poster`}
                  className="h-[300px] w-full rounded-[calc(var(--radius)-4px)] border border-[var(--border)] object-contain"
                >
                  <source src={`/api/media/file/${active.id}`} />
                </video>
              )}
              {items.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Предыдущее медиа"
                    onClick={() => move("prev")}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-sm"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    aria-label="Следующее медиа"
                    onClick={() => move("next")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-sm"
                  >
                    →
                  </button>
                </>
              ) : null}
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="text-xs font-medium text-[var(--foreground)]">
                  {active?.originalName}
                </div>
                <button
                  type="button"
                  disabled={remove.isPending || !active}
                  onClick={() => {
                    if (!active) return
                    remove.mutate(active.id, {
                      onSuccess: () => setActionError(null),
                      onError: (err) =>
                        setActionError(
                          err instanceof Error ? err.message : "Ошибка удаления файла",
                        ),
                    })
                  }}
                  className="text-xs font-semibold text-[var(--destructive)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {remove.isPending && remove.variables === active?.id
                    ? "Удаление..."
                    : "Удалить"}
                </button>
              </div>
            </div>

            {items.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {items.map((item, index) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setActiveIndex(index)}
                    className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-[calc(var(--radius)-4px)] border ${
                      index === effectiveActiveIndex
                        ? "border-[var(--ring)]"
                        : "border-[var(--border)]"
                    }`}
                  >
                    {item.type === "IMAGE" ? (
                      <Image
                        src={`/api/media/file/${item.id}?variant=previewSmall`}
                        alt={item.originalName}
                        width={160}
                        height={128}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[var(--muted)] text-[10px] text-[var(--muted-foreground)]">
                        VIDEO
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : hasQueryError ? (
          <div className="rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--muted)] p-6 text-sm text-[var(--muted-foreground)]">
            Не удалось загрузить список файлов. Повторите попытку.
          </div>
        ) : (
          <div className="rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--muted)] p-6 text-sm text-[var(--muted-foreground)]">
            Файлов пока нет. Добавьте изображение или видео выше.
          </div>
        )}
      </div>
      {lightboxItem?.type === "IMAGE" ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            aria-label="Закрыть"
            className="absolute right-4 top-4 rounded-[var(--radius)] border border-white/40 px-3 py-1 text-sm text-white"
            onClick={() => setLightboxIndex(null)}
          >
            Закрыть
          </button>
          {items.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Предыдущее изображение"
                onClick={(event) => {
                  event.stopPropagation()
                  setLightboxIndex((current) => {
                    if (current === null) return current
                    return current === 0 ? items.length - 1 : current - 1
                  })
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/40 px-3 py-1 text-xl text-white"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Следующее изображение"
                onClick={(event) => {
                  event.stopPropagation()
                  setLightboxIndex((current) => {
                    if (current === null) return current
                    return (current + 1) % items.length
                  })
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/40 px-3 py-1 text-xl text-white"
              >
                →
              </button>
            </>
          ) : null}
          <Image
            src={`/api/media/file/${lightboxItem.id}`}
            alt={lightboxItem.originalName}
            width={2200}
            height={1400}
            unoptimized
            className="max-h-[85vh] w-full max-w-6xl rounded-[var(--radius)] object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </Section>
  )
}
