import type { Area } from 'react-easy-crop'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (event) => reject(event))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = src
  })
}

export async function cropImage(
  imageSrc: string,
  cropArea: Area,
  options: { mimeType?: string; quality?: number } = {},
): Promise<Blob> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Canvas is not supported in this browser')
  }

  canvas.width = cropArea.width
  canvas.height = cropArea.height

  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height,
  )

  const mimeType = options.mimeType ?? 'image/jpeg'
  const quality = options.quality ?? 0.92

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), mimeType, quality)
  })

  if (!blob) {
    throw new Error('Failed to crop image')
  }

  return blob
}
