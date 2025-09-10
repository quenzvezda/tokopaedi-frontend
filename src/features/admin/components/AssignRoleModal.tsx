import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
  Stack,
} from '@chakra-ui/react'
import { useState } from 'react'

import { useAssignRoleToUser } from '../api/hooks'

import type { Role } from '../types'

interface AssignRoleModalProps {
  isOpen: boolean
  onClose: () => void
  accountId: string
  availableRoles: Role[]
}

export function AssignRoleModal({
  isOpen,
  onClose,
  accountId,
  availableRoles,
}: AssignRoleModalProps) {
  const assignMutation = useAssignRoleToUser()
  const [selected, setSelected] = useState<number[]>([])

  const toggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }

  const handleAssign = async () => {
    await Promise.all(
      selected.map((roleId) => assignMutation.mutateAsync({ accountId, roleId })),
    )
    setSelected([])
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Assign Roles</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack>
            {availableRoles.map((role) => (
              <Checkbox
                key={role.id}
                isChecked={selected.includes(role.id)}
                onChange={() => toggle(role.id)}
              >
                {role.name}
              </Checkbox>
            ))}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="teal"
            onClick={handleAssign}
            isLoading={assignMutation.isPending}
            isDisabled={selected.length === 0}
          >
            Assign
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
