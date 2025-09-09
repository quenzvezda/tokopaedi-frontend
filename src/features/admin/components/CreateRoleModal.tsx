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

import { useCreateRole } from '../api/hooks'
import { roleSchema } from '../types/role.zod'

type CreateRoleForm = z.infer<typeof roleSchema>

interface CreateRoleModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateRoleModal({ isOpen, onClose }: CreateRoleModalProps) {
  const createRole = useCreateRole()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateRoleForm>({
    resolver: zodResolver(roleSchema),
  })

  const onSubmit = handleSubmit(async (data) => {
    await createRole.mutateAsync(data)
    reset()
    onClose()
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={onSubmit}>
        <ModalHeader>Create New Role</ModalHeader>
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
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
