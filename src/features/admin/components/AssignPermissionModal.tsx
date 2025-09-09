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
  const { data, isLoading } = useGetAvailableRolePermissions(roleId)
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
          {isLoading && <Spinner />}
          {data && (
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
