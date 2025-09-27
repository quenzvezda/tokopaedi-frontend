import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Cropper, { type Area } from 'react-easy-crop'

import { cropImageToBlob } from '../lib/cropImage'

type AvatarCropModalProps = {
  file: File | null
  isOpen: boolean
  onCancel: () => void
  onConfirm: (file: File) => Promise<void> | void
  footerExtra?: ReactNode
}

const ZOOM_MIN = 1
const ZOOM_MAX = 3
const ZOOM_STEP = 0.1

export default function AvatarCropModal({
  file,
  isOpen,
  onCancel,
  onConfirm,
  footerExtra,
}: AvatarCropModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1.2)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setImageUrl(null)
      return
    }

    const url = URL.createObjectURL(file)
    setImageUrl(url)
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 })
      setZoom(1.2)
      setCroppedAreaPixels(null)
      setError(null)
    }
  }, [isOpen])

  const outputType = useMemo(() => {
    if (!file?.type) return 'image/png'
    return file.type.startsWith('image/') ? file.type : 'image/png'
  }, [file])

  if (!file) {
    return null
  }

  async function handleConfirm() {
    if (!imageUrl || !croppedAreaPixels) {
      setError('Unable to crop image, please try again.')
      return
    }

    setIsProcessing(true)
    setError(null)
    try {
      const blob = await cropImageToBlob(imageUrl, croppedAreaPixels, outputType)
      const croppedFile = new File([blob], file.name, { type: blob.type })
      await onConfirm(croppedFile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to crop image')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Adjust Avatar</ModalHeader>
        <ModalCloseButton disabled={isProcessing} />
        <ModalBody>
          <Stack spacing={4}>
            <Box position="relative" w="full" pt="100%" bg="gray.900" borderRadius="lg" overflow="hidden">
              {imageUrl ? (
                <Cropper
                  image={imageUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
                  objectFit="cover"
                  zoomWithScroll
                />
              ) : null}
            </Box>
            <Box>
              <Text fontWeight="medium" mb={2}>
                Zoom
              </Text>
              <Slider
                min={ZOOM_MIN}
                max={ZOOM_MAX}
                step={ZOOM_STEP}
                value={zoom}
                onChange={setZoom}
                isDisabled={isProcessing}
                aria-label="Zoom"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
            {error ? (
              <Text color="red.500" fontSize="sm">
                {error}
              </Text>
            ) : null}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Stack direction={{ base: 'column', sm: 'row' }} spacing={3} w="full" justify="flex-end">
            <Button variant="ghost" onClick={onCancel} isDisabled={isProcessing}>
              Cancel
            </Button>
            {footerExtra}
            <Button colorScheme="teal" onClick={handleConfirm} isLoading={isProcessing}>
              Save
            </Button>
          </Stack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
