import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons'
import {
  Box,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Text,
  Flex,
  IconButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react'
import React from 'react'

import { useDeleteRole, useGetRoles } from '../api/hooks'
import { CreateRoleModal } from '../components/CreateRoleModal'
import { EditRoleModal } from '../components/EditRoleModal'

import type { Role } from '../types'

function RoleManagement() {
  const { data: roles, isLoading, isError, error } = useGetRoles()
  const deleteRoleMutation = useDeleteRole()
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure()
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null)
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  const handleEditClick = (role: Role) => {
    setSelectedRole(role)
    onEditOpen()
  }

  const handleDeleteClick = (role: Role) => {
    setSelectedRole(role)
    onAlertOpen()
  }

  const confirmDelete = () => {
    if (selectedRole) {
      deleteRoleMutation.mutate(selectedRole.id, {
        onSuccess: () => {
          onAlertClose()
          setSelectedRole(null)
        },
      })
    }
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={8}>
        <Heading as="h2" size="xl">
          Manage Roles
        </Heading>
        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={onCreateOpen}>
          Create Role
        </Button>
      </Flex>

      {isLoading && <Spinner />}
      {isError && <Text color="red.500">Error: {error?.message}</Text>}

      {roles && (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {roles.map((role) => (
              <Tr key={role.id}>
                <Td>{role.id}</Td>
                <Td>{role.name}</Td>
                <Td>
                  <IconButton
                    aria-label="Edit role"
                    icon={<EditIcon />}
                    mr={2}
                    onClick={() => handleEditClick(role)}
                  />
                  <IconButton
                    aria-label="Delete role"
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    onClick={() => handleDeleteClick(role)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <CreateRoleModal isOpen={isCreateOpen} onClose={onCreateClose} />
      <EditRoleModal isOpen={isEditOpen} onClose={onEditClose} role={selectedRole} />

      <AlertDialog isOpen={isAlertOpen} leastDestructiveRef={cancelRef} onClose={onAlertClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Role
            </AlertDialogHeader>

            <AlertDialogBody>Are you sure? You can't undo this action afterwards.</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDelete}
                ml={3}
                isLoading={deleteRoleMutation.isPending}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}

export default function RolesPage() {
  return <RoleManagement />
}