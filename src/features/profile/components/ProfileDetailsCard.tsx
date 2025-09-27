import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'

import { toApiError } from '@/shared/lib/fetcher'

import AvatarCropModal from './AvatarCropModal'
import {
  useRequestAvatarUploadUrl,
  useUpdateMyProfile,
} from '../api/hooks'
import { profileFormSchema, type ProfileFormValues } from '../lib/schemas'

import type { UserProfileDto } from '../services/profile.service'

function normalizeOptional(value?: string | null) {
  const trimmed = value?.trim()
  if (!trimmed) return ''
  return trimmed
}

function toNullable(value?: string) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

type ProfileDetailsCardProps = {
  profile: UserProfileDto
  avatarUrl?: string | null
}

export default function ProfileDetailsCard({ profile, avatarUrl }: ProfileDetailsCardProps) {
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const [cropState, setCropState] = useState<{ url: string; file: File } | null>(null)

  const { mutateAsync: updateProfile, isPending: isSaving } = useUpdateMyProfile()
  const { mutateAsync: requestUpload } = useRequestAvatarUploadUrl()

  const defaultValues = useMemo<ProfileFormValues>(
    () => ({
      fullName: profile.fullName,
      bio: normalizeOptional(profile.bio),
      phone: normalizeOptional(profile.phone),
      avatarObjectKey: profile.avatarObjectKey ?? null,
    }),
    [profile],
  )

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (cropState?.url) URL.revokeObjectURL(cropState.url)
    }
  }, [cropState])

  useEffect(() => {
    if (avatarUrl && objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
      setLocalPreview(null)
    }
  }, [avatarUrl])

  const currentAvatar = localPreview ?? avatarUrl ?? undefined

  function resetFileInput() {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function closeCropper() {
    setCropState((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      return null
    })
    resetFileInput()
  }

  async function handleAvatarUpload(file: File) {
    setAvatarError(null)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Avatar must be at most 5 MB')
      toast({ title: 'Avatar too large', description: 'Avatar must be at most 5 MB', status: 'error' })
      return
    }
    setIsUploading(true)
    try {
      const presigned = await requestUpload({
        fileName: file.name,
        contentType: file.type || undefined,
      })
      const method = presigned.method ?? 'PUT'
      const headers: Record<string, string> = { ...(presigned.headers ?? {}) }
      if (file.type && !headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = file.type
      }
      const res = await fetch(presigned.url, {
        method,
        headers,
        body: file,
      })
      if (!res.ok) throw new Error('Failed to upload avatar')
      if (presigned.objectKey) {
        setValue('avatarObjectKey', presigned.objectKey, { shouldDirty: true })
      }
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
      const nextUrl = URL.createObjectURL(file)
      objectUrlRef.current = nextUrl
      setLocalPreview(nextUrl)
      toast({ title: 'Avatar uploaded', status: 'success' })
    } catch (err) {
      const { message } = toApiError(err)
      setAvatarError(message)
      toast({ title: 'Avatar upload failed', description: message, status: 'error' })
    } finally {
      setIsUploading(false)
      resetFileInput()
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      const message = 'Please select an image file'
      setAvatarError(message)
      toast({ title: 'Invalid file type', description: message, status: 'error' })
      resetFileInput()
      return
    }

    const url = URL.createObjectURL(file)
    setCropState({ url, file })
  }

  async function handleCropComplete(file: File) {
    await handleAvatarUpload(file)
    closeCropper()
  }

  function handleCropCancel() {
    closeCropper()
  }

  async function onSubmit(values: ProfileFormValues) {
    const payload = {
      fullName: values.fullName.trim(),
      bio: toNullable(values.bio),
      phone: toNullable(values.phone),
      avatarObjectKey: values.avatarObjectKey ?? null,
    }
    try {
      await updateProfile(payload)
      toast({ title: 'Profile updated', status: 'success' })
    } catch (err) {
      const { message } = toApiError(err)
      toast({ title: 'Update failed', description: message, status: 'error' })
    }
  }

  function removeAvatar() {
    setValue('avatarObjectKey', null, { shouldDirty: true })
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setLocalPreview(null)
  }

  return (
    <>
      <Card>
        <CardHeader fontWeight="semibold">My Profile</CardHeader>
        <CardBody>
          <Stack direction={{ base: 'column', md: 'row' }} spacing={8} align="flex-start">
            <VStack spacing={4} align="center">
              <Avatar size="2xl" name={profile.fullName} src={currentAvatar} />
              <Stack direction={{ base: 'column', sm: 'row' }} spacing={3} w="full" justify="center">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} isLoading={isUploading}>
                  Change Avatar
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  style={{ display: 'none' }}
                />
                <Button variant="ghost" colorScheme="red" onClick={removeAvatar} isDisabled={!watch('avatarObjectKey')}>
                  Remove
                </Button>
              </Stack>
              {avatarError && (
                <Box color="red.500" fontSize="sm">
                  {avatarError}
                </Box>
              )}
            </VStack>
          <Box as="form" onSubmit={handleSubmit(onSubmit)} flex={1} minW={0}>
            <Stack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.fullName}>
                <FormLabel>Full Name</FormLabel>
                <Input {...register('fullName')} placeholder="Your full name" autoComplete="name" />
                {errors.fullName && <FormErrorMessage>{errors.fullName.message}</FormErrorMessage>}
              </FormControl>
              <FormControl isInvalid={!!errors.bio}>
                <FormLabel>Bio</FormLabel>
                <Textarea {...register('bio')} rows={4} placeholder="Tell us about yourself" />
                {errors.bio && <FormErrorMessage>{errors.bio.message}</FormErrorMessage>}
              </FormControl>
              <FormControl isInvalid={!!errors.phone}>
                <FormLabel>Phone</FormLabel>
                <Input {...register('phone')} placeholder="08xxxxxxxxxx" autoComplete="tel" />
                {errors.phone && <FormErrorMessage>{errors.phone.message}</FormErrorMessage>}
              </FormControl>
              <Button colorScheme="teal" type="submit" isLoading={isSaving} isDisabled={!isDirty && !isUploading}>
                Save Changes
              </Button>
            </Stack>
          </Box>
        </Stack>
      </CardBody>
    </Card>
      {cropState && (
        <AvatarCropModal
          isOpen={!!cropState}
          imageUrl={cropState.url}
          fileName={cropState.file.name}
          mimeType={cropState.file.type || 'image/jpeg'}
          onCancel={handleCropCancel}
          onComplete={handleCropComplete}
        />
      )}
    </>
  )
}
