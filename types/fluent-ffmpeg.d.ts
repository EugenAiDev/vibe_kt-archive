declare module "fluent-ffmpeg" {
  type FfprobeData = {
    format: {
      duration?: number | null
    }
  }

  type ScreenshotOptions = {
    count: number
    filename: string
    folder: string
  }

  type Command = {
    on(event: "end", callback: () => void): Command
    on(event: "error", callback: (error: Error) => void): Command
    screenshots(options: ScreenshotOptions): void
  }

  type Ffmpeg = {
    (inputPath: string): Command
    setFfmpegPath(path: string): void
    setFfprobePath(path: string): void
    ffprobe(
      inputPath: string,
      callback: (error: Error | null, data: FfprobeData) => void,
    ): void
  }

  const ffmpeg: Ffmpeg
  export default ffmpeg
}

declare module "@ffmpeg-installer/ffmpeg" {
  const installer: { path: string }
  export = installer
}

declare module "@ffprobe-installer/ffprobe" {
  const installer: { path: string }
  export = installer
}
