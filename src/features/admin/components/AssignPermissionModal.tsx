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
  Spinner,
  Text,
} from '@chakra-ui/react'
import { useState } from 'react'

import {
  useAssignPermissionToRole,
  useGetAvailableRolePermissions,
} from '../api/hooks'

interface AssignPermissionModalProps {
  isOpen: boolean
  onClose: () => void
  roleId: number
}

export function AssignPermissionModal({
  isOpen,
  onClose,
  roleId,
}: AssignPermissionModalProps) {
  const { data, isLoading, isError, error, refetch } = useGetAvailableRolePermissions(roleId)
  const assignMutation = useAssignPermissionToRole()
  const [selected, setSelected] = useState<number[]>([])

  const toggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }

  const handleAssign = async () => {
    await Promise.all(
      selected.map((permissionId) =>
        assignMutation.mutateAsync({ roleId, permissionId }),
      ),
    )
    setSelected([])
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Assign Permissions</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading && (
            <Stack align="center">
              <Spinner />
            </Stack>
          )}
          {isError && (
            <Stack spacing={3} align="center">
              <Text color="red.500" textAlign="center">
                {error?.message ?? 'Failed to load available permissions'}
              </Text>
              <Button size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </Stack>
          )}
          {!isLoading && !isError && data && (
            <Stack>
              {data.map((perm) => (
                <Checkbox
                  key={perm.id}
                  isChecked={selected.includes(perm.id)}
                  onChange={() => toggle(perm.id)}
                >
                  {perm.name}
                </Checkbox>
              ))}
            </Stack>
          )}
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
