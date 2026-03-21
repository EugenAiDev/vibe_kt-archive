import path from "node:path"
import { promises as fs } from "node:fs"

export function buildMediaPaths(args: {
  baseDir: string
  id: string
  ext: string
  kind: "image" | "video"
}) {
  return {
    original: path.join(args.baseDir, "original", `${args.id}.${args.ext}`),
    previewSmall: path.join(args.baseDir, "previews", `${args.id}_320.webp`),
    previewLarge: path.join(args.baseDir, "previews", `${args.id}_960.webp`),
    poster: path.join(args.baseDir, "posters", `${args.id}.jpg`),
  }
}

export async function ensureMediaDirs(baseDir: string) {
  await fs.mkdir(path.join(baseDir, "original"), { recursive: true })
  await fs.mkdir(path.join(baseDir, "previews"), { recursive: true })
  await fs.mkdir(path.join(baseDir, "posters"), { recursive: true })
}
