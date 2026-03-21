export function detectMediaKind(mime: string): "image" | "video" {
  if (mime.startsWith("image/")) return "image"
  if (mime.startsWith("video/")) return "video"
  throw new Error("Unsupported")
}
