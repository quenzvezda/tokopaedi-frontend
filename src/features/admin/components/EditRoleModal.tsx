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
  Stack,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useUpdateRole } from '../api/hooks'

import type { Role } from '../types'

const updateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
})

type UpdateRoleForm = z.infer<typeof updateRoleSchema>

interface EditRoleModalProps {
  isOpen: boolean
  onClose: () => void
  role: Role | null
}

export function EditRoleModal({ isOpen, onClose, role }: EditRoleModalProps) {
  const updateRole = useUpdateRole()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateRoleForm>({
    resolver: zodResolver(updateRoleSchema),
    values: {
      name: role?.name ?? '',
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    if (!role) return
    await updateRole.mutateAsync({ id: role.id, data })
    reset()
    onClose()
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={onSubmit}>
        <ModalHeader>Edit Role</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            <FormControl isInvalid={!!errors.name}>
              <FormLabel htmlFor="name">Role Name</FormLabel>
              <Input id="name" type="text" {...register('name')} />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="teal" type="submit" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
