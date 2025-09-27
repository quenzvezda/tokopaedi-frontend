import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'

import { cropImage } from '../lib/cropImage'

import 'react-easy-crop/react-easy-crop.css'

const MIN_ZOOM = 1
const MAX_ZOOM = 3

const cropContainerStyles: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '320px',
  background: '#0f172a',
}

type AvatarCropModalProps = {
  isOpen: boolean
  imageUrl: string
  fileName: string
  mimeType: string
  onCancel: () => void
  onComplete: (file: File) => Promise<void> | void
}

export default function AvatarCropModal({
  isOpen,
  imageUrl,
  fileName,
  mimeType,
  onCancel,
  onComplete,
}: AvatarCropModalProps) {
  const toast = useToast()
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const defaultFileName = useMemo(() => fileName || 'avatar-cropped', [fileName])
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!isOpen) {
      return
    }
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedArea(null)
  }, [imageUrl, isOpen])

  function handleCropComplete(_: Area, croppedAreaPixels: Area) {
    setCroppedArea(croppedAreaPixels)
  }

  async function handleApplyCrop() {
    if (!croppedArea) {
      toast({ title: 'Crop area is not ready', status: 'error' })
      return
    }

    setIsProcessing(true)
    try {
      const blob = await cropImage(imageUrl, croppedArea, { mimeType })
      const finalName = defaultFileName
      const file = new File([blob], finalName, { type: mimeType || blob.type })
      await onComplete(file)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to crop image'
      toast({ title: 'Crop failed', description: message, status: 'error' })
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false)
      }
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onCancel} isCentered size="xl">
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent>
        <ModalHeader>Crop Avatar</ModalHeader>
        <ModalBody>
          <Box style={cropContainerStyles} borderRadius="md" overflow="hidden">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          </Box>
          <Box mt={4}>
            <Text fontSize="sm" mb={2} color="gray.500">
              Zoom
            </Text>
            <Slider
              aria-label="zoom"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.1}
              value={zoom}
              onChange={setZoom}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </Box>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button variant="ghost" onClick={onCancel} isDisabled={isProcessing}>
            Cancel
          </Button>
          <Button colorScheme="teal" onClick={handleApplyCrop} isLoading={isProcessing}>
            Crop & Upload
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
