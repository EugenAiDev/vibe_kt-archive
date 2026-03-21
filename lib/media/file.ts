type MediaRecord = {
  type: "IMAGE" | "VIDEO"
  filename: string | null
  mimeType: string
  previewSmall: string | null
  previewLarge: string | null
  poster: string | null
}

export function resolveMediaVariant(item: MediaRecord, variant: string) {
  if (variant === "previewSmall") {
    if (item.previewSmall) return { filePath: item.previewSmall, contentType: "image/webp" }
    if (item.type === "IMAGE") return { filePath: item.filename, contentType: item.mimeType }
    return { filePath: null, contentType: "image/webp" }
  }
  if (variant === "previewLarge") {
    if (item.previewLarge) return { filePath: item.previewLarge, contentType: "image/webp" }
    if (item.type === "IMAGE") return { filePath: item.filename, contentType: item.mimeType }
    return { filePath: null, contentType: "image/webp" }
  }
  if (variant === "poster") {
    if (item.poster) return { filePath: item.poster, contentType: "image/jpeg" }
    return { filePath: null, contentType: "image/jpeg" }
  }
  return { filePath: item.filename, contentType: item.mimeType }
}
