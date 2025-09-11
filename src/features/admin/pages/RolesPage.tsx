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
  HStack,
} from '@chakra-ui/react'
import React from 'react'
import { Link } from 'react-router-dom'

import { useDeleteRole, useGetRoles } from '../api/hooks'
import { CreateRoleModal } from '../components/CreateRoleModal'
import { EditRoleModal } from '../components/EditRoleModal'

import type { Role } from '../types'

function RoleManagement() {
  const [page, setPage] = React.useState(0)
  const [size] = React.useState(12)
  const { data, isLoading, isError, error, isFetching } = useGetRoles({ page, size })
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

      {data && (
        <Table variant="simple" size="sm" sx={{ 'th, td': { py: 1, px: 2, fontSize: 'sm' } }}>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.content.map((role) => {
              const r: Role = { id: role.id ?? 0, name: role.name }
              return (
              <Tr key={role.id}>
                <Td>{r.id}</Td>
                <Td>{r.name}</Td>
                <Td>
                  <Button
                    as={Link}
                    to={`/admin/role/${r.id}/assign`}
                    size="sm"
                    mr={2}
                    leftIcon={<AddIcon />}
                  >
                    Permissions
                  </Button>
                  <IconButton
                    aria-label="Edit role"
                    icon={<EditIcon />}
                    mr={2}
                    onClick={() => handleEditClick(r)}
                  />
                  <IconButton
                    aria-label="Delete role"
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    onClick={() => handleDeleteClick(r)}
                  />
                </Td>
              </Tr>
              )
            })}
          </Tbody>
        </Table>
      )}

      {data && (
        <HStack justify="center" mt={4} spacing={4}>
          <Button onClick={() => setPage((p) => Math.max(0, p - 1))} isDisabled={page <= 0}>
            Previous
          </Button>
          <Text>
            Page {page + 1} of {data.totalPages ?? 1}
            {isFetching ? ' • Refreshing' : ''}
          </Text>
          <Button
            onClick={() => setPage((p) => Math.min((data.totalPages ?? 1) - 1, p + 1))}
            isDisabled={page + 1 >= (data.totalPages ?? 1)}
          >
            Next
          </Button>
        </HStack>
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
