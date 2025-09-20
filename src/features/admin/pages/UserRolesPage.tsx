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
  Stack,
  Center,
  Skeleton,
} from '@chakra-ui/react'
import React from 'react'
import { Link, useParams } from 'react-router-dom'

import { useGetRoles, useGetUserRoles, useRemoveRoleFromUser } from '../api/hooks'
import { AssignRoleModal } from '../components/AssignRoleModal'

import type { Role } from '../types'

const baseTableStyles = {
  'th, td': { py: 2, px: 3, fontSize: 'sm' },
  'thead th': {
    position: 'sticky',
    top: 0,
    zIndex: 0,
    bg: 'gray.100',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontSize: 'xs',
    color: 'gray.500',
  },
}

export default function UserRolesPage() {
  const { accountId } = useParams()
  const {
    data: rolesPage,
    isLoading: isRolesLoading,
    isError: isRolesError,
    error: rolesError,
  } = useGetRoles({ page: 0, size: 200, sort: ['name,asc'] })
  const {
    data: roleNames,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
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
    if (!roleNames) return []
    if (!rolesPage) {
      return roleNames.map((name, idx) => ({ id: idx, name }))
    }
    return rolesPage.content
      .filter((r) => roleNames.includes(r.name))
      .map((r) => ({ id: r.id ?? 0, name: r.name }))
  }, [roleNames, rolesPage])

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

  const isInitialLoading = isLoading || isRolesLoading
  const hasError = isError || isRolesError
  const errorMessage = error?.message || rolesError?.message || 'Failed to load roles'
  const totalAssigned = assignedRoles.length

  return (
    <Box>
      <Button as={Link} to="/admin/users" variant="link" mb={4}>
        &lt; Users
      </Button>
      <Stack spacing={6}>
        <Flex justify="space-between" align="center">
          <Heading as="h2" size="xl">
            User Roles
          </Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="teal"
            onClick={onAssignOpen}
            isDisabled={!rolesPage}
          >
            Assign Role
          </Button>
        </Flex>
        <Text fontSize="sm" color="gray.600">
          Total roles assigned: {totalAssigned}
          {isFetching ? ' - Refreshing' : ''}
        </Text>

        {isInitialLoading ? (
          <Table
            variant="striped"
            colorScheme="gray"
            size="sm"
            sx={{ ...baseTableStyles, 'tbody tr:hover td': { bg: 'gray.100' } }}
          >
            <Thead>
              <Tr>
                <Th textAlign="right" width="6ch">
                  ID
                </Th>
                <Th>Role</Th>
                <Th textAlign="right" width="120px">
                  Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {Array.from({ length: 4 }).map((_, index) => (
                <Tr key={index}>
                  <Td textAlign="right" width="6ch">
                    <Skeleton height="16px" />
                  </Td>
                  <Td>
                    <Skeleton height="16px" />
                  </Td>
                  <Td textAlign="right">
                    <Skeleton height="16px" />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : hasError ? (
          <Center py={10}>
            <Stack spacing={2} align="center">
              <Heading size="md">Error</Heading>
              <Text color="red.500">{errorMessage}</Text>
              <Button onClick={() => refetch()}>Retry</Button>
            </Stack>
          </Center>
        ) : totalAssigned === 0 ? (
          <Center py={10}>
            <Stack spacing={2} align="center">
              <Heading size="md">No roles yet</Heading>
              <Text color="gray.500">Assign a role to get started.</Text>
            </Stack>
          </Center>
        ) : (
          <Table
            variant="striped"
            colorScheme="gray"
            size="sm"
            sx={{ ...baseTableStyles, 'tbody tr:hover td': { bg: 'teal.50' } }}
          >
            <Thead>
              <Tr>
                <Th textAlign="right" width="6ch">
                  ID
                </Th>
                <Th>Role</Th>
                <Th textAlign="right" width="120px">
                  Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {assignedRoles.map((role) => (
                <Tr key={role.id}>
                  <Td textAlign="right" fontWeight="semibold" width="6ch">
                    {role.id}
                  </Td>
                  <Td>
                    <Text fontFamily="mono" fontWeight="medium">
                      {role.name}
                    </Text>
                  </Td>
                  <Td textAlign="right">
                    <IconButton
                      aria-label="Remove role"
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      variant="outline"
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
      </Stack>
    </Box>
  )
}
