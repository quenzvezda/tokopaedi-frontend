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
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { useUpdateRole } from '../api/hooks'
import { normalizeRoleName, roleNameSchema } from '../lib/roleName'

import type { Role } from '../types'

const updateRoleSchema = z.object({
  name: roleNameSchema,
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
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateRoleForm>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      name: role?.name ? normalizeRoleName(role.name, { trimEdges: true }) : '',
    },
  })

  useEffect(() => {
    reset({
      name: role?.name ? normalizeRoleName(role.name, { trimEdges: true }) : '',
    })
  }, [reset, role])

  const onSubmit = handleSubmit(async (data) => {
    if (!role) return
    const payload = {
      name: normalizeRoleName(data.name, { trimEdges: true }),
    }
    await updateRole.mutateAsync({ id: role.id, data: payload })
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
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
