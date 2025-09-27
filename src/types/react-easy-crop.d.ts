declare module 'react-easy-crop' {
  import * as React from 'react'

  export interface Area {
    x: number
    y: number
    width: number
    height: number
  }

  export interface Point {
    x: number
    y: number
  }

  export interface CropperProps {
    image: string
    crop: Point
    zoom: number
    aspect?: number
    onCropChange?: (location: Point) => void
    onZoomChange?: (zoom: number) => void
    onCropComplete?: (croppedArea: Area, croppedAreaPixels: Area) => void
    objectFit?: 'contain' | 'cover'
    zoomWithScroll?: boolean
  }

  const Cropper: React.FC<CropperProps>

  export default Cropper
  export type { Area }
}
