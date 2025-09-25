import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useToast,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import useAuth from '@/features/auth/useAuth'
import { toApiError } from '@/shared/lib/fetcher'

import { useCreateStore } from '../api/hooks'
import { storeFormSchema, type StoreFormValues } from '../lib/schemas'

type CreateStoreModalProps = {
  isOpen: boolean
  onClose: () => void
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function CreateStoreModal({ isOpen, onClose }: CreateStoreModalProps) {
  const toast = useToast()
  const { refresh } = useAuth()
  const { mutateAsync, isPending } = useCreateStore()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: { name: '', slug: '', description: '' },
  })

  const nameValue = watch('name')
  const slugTouched = dirtyFields.slug

  useEffect(() => {
    if (!isOpen) {
      reset({ name: '', slug: '', description: '' })
    }
  }, [isOpen, reset])

  useEffect(() => {
    if (slugTouched) return
    const nextSlug = slugify(nameValue ?? '')
    setValue('slug', nextSlug, { shouldDirty: false })
  }, [nameValue, slugTouched, setValue])

  async function onSubmit(values: StoreFormValues) {
    try {
      await mutateAsync({
        name: values.name.trim(),
        slug: values.slug.trim(),
        description: values.description?.trim() ? values.description.trim() : null,
      })
      toast({ title: 'Store created', status: 'success' })
      onClose()
      await refresh().catch(() => null)
    } catch (err) {
      const { message } = toApiError(err)
      toast({ title: 'Create store failed', description: message, status: 'error' })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>Create Store</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isRequired isInvalid={!!errors.name} mb={4}>
            <FormLabel>Store Name</FormLabel>
            <Input {...register('name')} placeholder="Awesome Store" />
            {errors.name && <FormErrorMessage>{errors.name.message}</FormErrorMessage>}
          </FormControl>
          <FormControl isRequired isInvalid={!!errors.slug} mb={4}>
            <FormLabel>Slug</FormLabel>
            <Input {...register('slug')} placeholder="awesome-store" />
            {errors.slug && <FormErrorMessage>{errors.slug.message}</FormErrorMessage>}
          </FormControl>
          <FormControl isInvalid={!!errors.description}>
            <FormLabel>Description</FormLabel>
            <Textarea {...register('description')} rows={3} placeholder="Optional description" />
            {errors.description && <FormErrorMessage>{errors.description.message}</FormErrorMessage>}
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="teal" type="submit" isLoading={isPending}>
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
