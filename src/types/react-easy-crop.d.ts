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

  export interface Size {
    width: number
    height: number
  }

  export interface MediaSize extends Size {
    naturalWidth: number
    naturalHeight: number
  }

  export interface CropperStyle {
    containerStyle?: React.CSSProperties
    mediaStyle?: React.CSSProperties
    cropAreaStyle?: React.CSSProperties
  }

  export interface CropperProps {
    image: string
    crop: Point
    zoom: number
    aspect?: number
    minZoom?: number
    maxZoom?: number
    cropShape?: 'rect' | 'round'
    onCropChange?: (location: Point) => void
    onZoomChange?: (zoom: number) => void
    onCropComplete?: (croppedArea: Area, croppedAreaPixels: Area) => void
    onMediaLoaded?: (mediaSize: MediaSize) => void
    objectFit?: 'contain' | 'cover'
    zoomWithScroll?: boolean
    style?: CropperStyle
  }

  const Cropper: React.FC<CropperProps>

  export default Cropper
  export type { Area, MediaSize }
}
