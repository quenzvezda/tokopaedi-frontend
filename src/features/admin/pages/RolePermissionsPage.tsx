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

import {
  useGetRole,
  useGetRolePermissions,
  useRemovePermissionFromRole,
} from '../api/hooks'
import { AssignPermissionModal } from '../components/AssignPermissionModal'

import type { Permission } from '../types'

export default function RolePermissionsPage() {
  const { id } = useParams()
  const roleId = Number(id)
  const { data: role } = useGetRole(roleId)
  const { data, isLoading, isError, error } = useGetRolePermissions(roleId)
  const removeMutation = useRemovePermissionFromRole()
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
  const [selectedPermission, setSelectedPermission] = React.useState<Permission | null>(null)

  const handleRemoveClick = (perm: Permission) => {
    setSelectedPermission(perm)
    onAlertOpen()
  }

  const confirmRemove = () => {
    if (selectedPermission) {
      removeMutation.mutate(
        { roleId, permissionId: selectedPermission.id },
        {
          onSuccess: () => {
            onAlertClose()
            setSelectedPermission(null)
          },
        },
      )
    }
  }

  return (
    <Box>
      <Button as={Link} to="/admin/roles" variant="link" mb={4}>
        &lt; Roles
      </Button>
      <Flex justify="space-between" align="center" mb={8}>
        <Heading as="h2" size="xl">
          {role ? `${role.name} Permission` : 'Permission'}
        </Heading>
        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={onAssignOpen}>
          Assign Permission
        </Button>
      </Flex>

      {isLoading && <Spinner />}
      {isError && <Text color="red.500">Error: {error?.message}</Text>}

      {data && (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th textAlign="right" width="6ch">ID</Th>
              <Th>Name</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((perm) => (
              <Tr key={perm.id}>
                <Td textAlign="right" width="6ch">{perm.id}</Td>
                <Td>{perm.name}</Td>
                <Td>
                  <IconButton
                    aria-label="Remove permission"
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    size="sm"
                    onClick={() => handleRemoveClick(perm)}
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
              Remove Permission
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

      <AssignPermissionModal
        isOpen={isAssignOpen}
        onClose={onAssignClose}
        roleId={roleId}
      />
    </Box>
  )
}
