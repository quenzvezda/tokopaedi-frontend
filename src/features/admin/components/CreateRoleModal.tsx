import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
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
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { useCreateRole } from '../api/hooks'
import { normalizeRoleName, roleNameSchema } from '../lib/roleName'

const createRoleSchema = z.object({
  name: roleNameSchema,
})

type CreateRoleForm = z.infer<typeof createRoleSchema>

interface CreateRoleModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateRoleModal({ isOpen, onClose }: CreateRoleModalProps) {
  const createRole = useCreateRole()
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateRoleForm>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: '',
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      name: normalizeRoleName(data.name, { trimEdges: true }),
    }
    await createRole.mutateAsync(payload)
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
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="name"
                    type="text"
                    value={field.value ?? ''}
                    onChange={(event) => {
                      const normalized = normalizeRoleName(event.target.value)
                      field.onChange(normalized)
                    }}
                    onBlur={(event) => {
                      const trimmed = normalizeRoleName(event.target.value, { trimEdges: true })
                      field.onChange(trimmed)
                      field.onBlur()
                    }}
                  />
                )}
              />
              <FormHelperText>
                Uppercase letters only. Spaces become underscores automatically.
              </FormHelperText>
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
