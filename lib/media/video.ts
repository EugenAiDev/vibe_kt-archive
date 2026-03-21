import path from "node:path"

type FfprobeData = {
  format: {
    duration?: number | null
  }
}

type FfmpegCommand = {
  on(event: "end", callback: () => void): FfmpegCommand
  on(event: "error", callback: (error: Error) => void): FfmpegCommand
  screenshots(options: {
    count: number
    filename: string
    folder: string
  }): void
}

type FfmpegModule = {
  (inputPath: string): FfmpegCommand
  setFfmpegPath(path: string): void
  setFfprobePath(path: string): void
  ffprobe(
    inputPath: string,
    callback: (error: Error | null, data: FfprobeData) => void,
  ): void
}

let cachedFfmpeg: FfmpegModule | null = null

async function getFfmpeg() {
  if (cachedFfmpeg) return cachedFfmpeg

  const ffmpegModule = await import("fluent-ffmpeg")
  const ffmpeg = (ffmpegModule.default ?? ffmpegModule) as FfmpegModule
  const ffmpegInstallerModule = await import("@ffmpeg-installer/ffmpeg")
  const ffprobeInstallerModule = await import("@ffprobe-installer/ffprobe")
  const ffmpegInstaller = (ffmpegInstallerModule.default ?? ffmpegInstallerModule) as {
    path: string
  }
  const ffprobeInstaller = (ffprobeInstallerModule.default ?? ffprobeInstallerModule) as {
    path: string
  }

  ffmpeg.setFfmpegPath(ffmpegInstaller.path)
  ffmpeg.setFfprobePath(ffprobeInstaller.path)
  cachedFfmpeg = ffmpeg
  return ffmpeg
}

export async function createVideoPoster(inputPath: string, posterPath: string) {
  const ffmpeg = await getFfmpeg()
  const folder = path.dirname(posterPath)
  const filename = path.basename(posterPath)

  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .screenshots({ count: 1, filename, folder })
  })
}

export async function readVideoDuration(inputPath: string) {
  const ffmpeg = await getFfmpeg()
  return new Promise<number | null>((resolve) => {
    ffmpeg.ffprobe(inputPath, (err, data) => {
      if (err) return resolve(null)
      resolve(data.format.duration ?? null)
    })
  })
}
