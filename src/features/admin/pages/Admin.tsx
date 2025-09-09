import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
  Heading,
  HStack,
  IconButton,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { Button, useDisclosure } from '@chakra-ui/react'
import React from 'react'
import { FaEdit, FaTrash } from 'react-icons/fa'

import { Footer, Header } from '@/shared/ui/PageLayout'

import { useDeleteRole, useGetRoles } from '../api/hooks'
import { ConfirmationModal } from '../components/ConfirmationModal'
import { CreateRoleModal } from '../components/CreateRoleModal'
import { EditRoleModal } from '../components/EditRoleModal'
import { type Role } from '../services/role.service'

function RoleManagement() {
  const { data: roles, isLoading, isError, error } = useGetRoles()
  const deleteRole = useDeleteRole()
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null)

  const handleEditClick = (role: Role) => {
    setSelectedRole(role)
    onEditOpen()
  }

  const handleDeleteClick = (role: Role) => {
    setSelectedRole(role)
    onDeleteOpen()
  }

  const confirmDelete = async () => {
    if (!selectedRole) return
    await deleteRole.mutateAsync(selectedRole.id)
    onDeleteClose()
    setSelectedRole(null)
  }

  if (isLoading) {
    return <Spinner />
  }

  if (isError) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>{error?.message || 'Failed to load roles'}</AlertTitle>
      </Alert>
    )
  }

  return (
    <>
      <CreateRoleModal isOpen={isCreateOpen} onClose={onCreateClose} />
      <EditRoleModal isOpen={isEditOpen} onClose={onEditClose} role={selectedRole} />
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
        title="Delete Role"
        body={`Are you sure you want to delete the role "${selectedRole?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isConfirming={deleteRole.isPending}
      />
      <Stack spacing={4}>
        <HStack justify="space-between">
          <Heading size="md">Roles</Heading>
          <Button colorScheme="teal" size="sm" onClick={onCreateOpen}>
            Create Role
          </Button>
        </HStack>
        <Table variant="simple">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Name</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {roles?.map((role) => (
            <Tr key={role.id}>
              <Td>{role.id}</Td>
              <Td>{role.name}</Td>
              <Td>
                <HStack>
                  <IconButton
                    aria-label="Edit role"
                    icon={<FaEdit />}
                    size="sm"
                    onClick={() => handleEditClick(role)}
                  />
                  <IconButton
                    aria-label="Delete role"
                    icon={<FaTrash />}
                    size="sm"
                    onClick={() => handleDeleteClick(role)}
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Stack>
    </>
  )
}

export default function Admin() {
  return (
    <Flex direction="column" minH="100vh">
      <Header showSearchBar={false} />
      <Box as="main" flex={1} p={8}>
        <Stack spacing={4}>
          <Heading size="lg">Admin Panel</Heading>
          <Text>This is a restricted area. Only admins can see this.</Text>
          <Box as="section" mt={8}>
            <RoleManagement />
          </Box>
        </Stack>
      </Box>
      <Footer />
    </Flex>
  )
}

