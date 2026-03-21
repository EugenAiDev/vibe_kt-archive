import sharp from "sharp"

export async function createImagePreviews(
  inputPath: string,
  smallPath: string,
  largePath: string
) {
  await sharp(inputPath).resize({ width: 320 }).webp({ quality: 80 }).toFile(smallPath)
  await sharp(inputPath).resize({ width: 960 }).webp({ quality: 80 }).toFile(largePath)
}

export async function readImageSize(inputPath: string) {
  const meta = await sharp(inputPath).metadata()
  return { width: meta.width ?? null, height: meta.height ?? null }
}
