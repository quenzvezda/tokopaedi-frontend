import type { Area } from 'react-easy-crop'

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', () => reject(new Error('Unable to load image')))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = src
  })
}

export async function cropImageToBlob(
  imageSrc: string,
  cropArea: Area,
  outputType: string,
  quality = 0.92,
) {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Failed to create canvas context')
  }

  canvas.width = cropArea.width
  canvas.height = cropArea.height

  context.drawImage(
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

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to crop image'))
        }
      },
      outputType,
      quality,
    )
  })
}
