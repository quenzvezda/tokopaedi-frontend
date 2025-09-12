import { AddIcon, DeleteIcon } from '@chakra-ui/icons'
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
  IconButton,
  Flex,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react'
import React from 'react'
import { Link, useParams } from 'react-router-dom'

import { useGetRoles, useGetUserRoles, useRemoveRoleFromUser } from '../api/hooks'
import { AssignRoleModal } from '../components/AssignRoleModal'

import type { Role } from '../types'

export default function UserRolesPage() {
  const { accountId } = useParams()
  // For assignment, fetch a large first page to approximate full list
  const { data: rolesPage } = useGetRoles({ page: 0, size: 1000 })
  const {
    data: roleNames,
    isLoading,
    isError,
    error,
  } = useGetUserRoles(accountId ?? '')
  const removeMutation = useRemoveRoleFromUser()
  const {
    isOpen: isAssignOpen,
    onOpen: onAssignOpen,
    onClose: onAssignClose,
  } = useDisclosure()
  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure()
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null)

  const assignedRoles = React.useMemo(() => {
    if (!rolesPage || !roleNames) return []
    return rolesPage.content
      .filter((r) => roleNames.includes(r.name))
      .map((r) => ({ id: r.id ?? 0, name: r.name }))
  }, [rolesPage, roleNames])

  const availableRoles = React.useMemo(() => {
    if (!rolesPage || !roleNames) return []
    return rolesPage.content
      .filter((r) => !roleNames.includes(r.name))
      .map((r) => ({ id: r.id ?? 0, name: r.name }))
  }, [rolesPage, roleNames])

  const handleRemoveClick = (role: Role) => {
    setSelectedRole(role)
    onAlertOpen()
  }

  const confirmRemove = () => {
    if (selectedRole && accountId) {
      removeMutation.mutate(
        { accountId, roleId: selectedRole.id },
        {
          onSuccess: () => {
            onAlertClose()
            setSelectedRole(null)
          },
        },
      )
    }
  }

  return (
    <Box>
      <Button as={Link} to="/admin/users" variant="link" mb={4}>
        &lt; Users
      </Button>
      <Flex justify="space-between" align="center" mb={8}>
        <Heading as="h2" size="xl">
          User Roles
        </Heading>
        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={onAssignOpen}>
          Assign Role
        </Button>
      </Flex>

      {isLoading && <Spinner />}
      {isError && <Text color="red.500">Error: {error?.message}</Text>}

      {assignedRoles && (
        <Table variant="simple" size="sm" sx={{ 'th, td': { py: 1, px: 2, fontSize: 'sm' } }}>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {assignedRoles.map((role) => (
              <Tr key={role.id}>
                <Td>{role.id}</Td>
                <Td>{role.name}</Td>
                <Td>
                  <IconButton
                    aria-label="Remove role"
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    size="sm"
                    onClick={() => handleRemoveClick(role)}
                    isLoading={removeMutation.isPending}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <AlertDialog isOpen={isAlertOpen} leastDestructiveRef={cancelRef} onClose={onAlertClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Remove Role
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                No
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmRemove}
                ml={3}
                isLoading={removeMutation.isPending}
              >
                Yes
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {accountId && (
        <AssignRoleModal
          isOpen={isAssignOpen}
          onClose={onAssignClose}
          accountId={accountId}
          availableRoles={availableRoles}
        />
      )}
    </Box>
  )
}
