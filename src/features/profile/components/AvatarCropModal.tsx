import {
  AspectRatio,
  Box,
  Button,
  HStack,
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
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type WheelEvent,
} from 'react'
import Cropper, { type Area, type MediaSize } from 'react-easy-crop'

import { cropImageToBlob } from '../lib/cropImage'

type AvatarCropModalProps = {
  file: File | null
  isOpen: boolean
  onCancel: () => void
  onConfirm: (file: File) => Promise<void> | void
  footerExtra?: ReactNode
}

const ZOOM_MAX = 3
const ZOOM_STEP = 0.01
const PREVIEW_SIZE = 96
const MIN_ZOOM_FLOOR = 0.4

function calculateAdaptiveMinZoom(width: number, height: number) {
  if (!width || !height) {
    return 1
  }

  const ratio = width / height
  const baseMinZoom = ratio > 1 ? height / width : width / height
  const sanitized = Number.isFinite(baseMinZoom) && baseMinZoom > 0 ? baseMinZoom : 1
  const limited = Math.min(1, sanitized)

  return Math.max(MIN_ZOOM_FLOOR, limited)
}

export default function AvatarCropModal({
  file,
  isOpen,
  onCancel,
  onConfirm,
  footerExtra,
}: AvatarCropModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [minZoom, setMinZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [imageDimensions, setImageDimensions] = useState<{
    width: number
    height: number
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setImageUrl(null)
      setImageDimensions(null)
      setMinZoom(1)
      setZoom(1)
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
      setCroppedAreaPixels(null)
      setError(null)
    }
  }, [isOpen])

  const outputType = useMemo(() => {
    if (!file?.type) return 'image/png'
    return file.type.startsWith('image/') ? file.type : 'image/png'
  }, [file])

  const clampZoom = useCallback(
    (value: number) => Math.min(Math.max(value, minZoom), ZOOM_MAX),
    [minZoom],
  )

  const handleMediaLoaded = useCallback(
    ({ naturalHeight, naturalWidth }: MediaSize) => {
      setImageDimensions({ width: naturalWidth, height: naturalHeight })

      const adaptiveMinZoom = calculateAdaptiveMinZoom(naturalWidth, naturalHeight)

      setMinZoom(adaptiveMinZoom)
      setZoom(adaptiveMinZoom)
    },
    [],
  )

  useEffect(() => {
    if (!isOpen || !imageDimensions) return

    const adaptiveMinZoom = calculateAdaptiveMinZoom(
      imageDimensions.width,
      imageDimensions.height,
    )

    setMinZoom(adaptiveMinZoom)
    setZoom(adaptiveMinZoom)
  }, [imageDimensions, isOpen])

  async function handleConfirm() {
    if (!imageUrl || !croppedAreaPixels || !file) {
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

  const previewStyles = useMemo(() => {
    if (!imageUrl || !croppedAreaPixels || !imageDimensions) {
      return null
    }

    const scale = PREVIEW_SIZE / croppedAreaPixels.width

    return {
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: `${imageDimensions.width * scale}px ${imageDimensions.height * scale}px`,
      backgroundPosition: `${-croppedAreaPixels.x * scale}px ${-croppedAreaPixels.y * scale}px`,
    }
  }, [croppedAreaPixels, imageDimensions, imageUrl])

  const handleWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()
      const delta = -event.deltaY * 0.0025
      setZoom((prev) => clampZoom(prev + delta))
    },
    [clampZoom],
  )

  const handleZoomChange = useCallback(
    (value: number) => {
      setZoom(clampZoom(value))
    },
    [clampZoom],
  )

  if (!file) {
    return null
  }

  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Adjust Avatar</ModalHeader>
        <ModalCloseButton disabled={isProcessing} />
        <ModalBody>
          <Stack spacing={4}>
            <AspectRatio ratio={1} w="full">
              <Box
                position="relative"
                bg="gray.900"
                borderRadius="lg"
                overflow="hidden"
                onWheel={handleWheel}
              >
                {imageUrl ? (
                  <Cropper
                    image={imageUrl}
                    crop={crop}
                    zoom={zoom}
                    minZoom={minZoom}
                    maxZoom={ZOOM_MAX}
                    aspect={1}
                    cropShape="round"
                    onCropChange={setCrop}
                    onZoomChange={handleZoomChange}
                    onCropComplete={(_, areaPixels: Area) => setCroppedAreaPixels(areaPixels)}
                    onMediaLoaded={handleMediaLoaded}
                    objectFit="contain"
                    zoomWithScroll={false}
                    style={{
                      containerStyle: { cursor: 'grab' },
                      cropAreaStyle: { border: '2px solid rgba(255, 255, 255, 0.6)' },
                    }}
                  />
                ) : null}
              </Box>
            </AspectRatio>
            <HStack align="flex-start" spacing={6} flexWrap="wrap">
              <Box flex="1" minW="220px">
                <Text fontWeight="medium" mb={2}>
                  Zoom
                </Text>
                <Slider
                  min={minZoom}
                  max={ZOOM_MAX}
                  step={ZOOM_STEP}
                  value={zoom}
                  onChange={handleZoomChange}
                  isDisabled={isProcessing}
                  aria-label="Zoom"
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <Text fontSize="sm" color="gray.500" mt={2}>
                  Gunakan scroll atau slider untuk menyetel zoom dengan presisi.
                </Text>
              </Box>
              <Stack spacing={2} align="center">
                <Text fontWeight="medium">Preview</Text>
                <Box
                  w={`${PREVIEW_SIZE}px`}
                  h={`${PREVIEW_SIZE}px`}
                  borderRadius="full"
                  borderWidth="2px"
                  borderColor="gray.200"
                  bg="gray.100"
                  overflow="hidden"
                  position="relative"
                >
                  {previewStyles ? (
                    <Box
                      w="full"
                      h="full"
                      backgroundRepeat="no-repeat"
                      backgroundPosition={previewStyles.backgroundPosition}
                      backgroundSize={previewStyles.backgroundSize}
                      backgroundImage={previewStyles.backgroundImage}
                    />
                  ) : null}
                </Box>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Simpan gambar beresolusi tinggi dan pastikan ukuran file masih di dalam batas unggahan.
                </Text>
              </Stack>
            </HStack>
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
