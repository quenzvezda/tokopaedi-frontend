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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import React from 'react'

import {
  useGetPermissions,
  useDeletePermission,
  useCreatePermission,
  useUpdatePermission,
} from '../api/hooks'
import { PermissionForm } from '../components/PermissionForm'

import type { Permission, PermissionRequest } from '../types'

const PermissionsPage = () => {
  const [page, setPage] = React.useState(0)
  const [size] = React.useState(12)
  const { data, isLoading, isError, error, isFetching } = useGetPermissions({ page, size })
  const createPermissionMutation = useCreatePermission()
  const updatePermissionMutation = useUpdatePermission()
  const deletePermissionMutation = useDeletePermission()

  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure()
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure()

  const [selectedPermission, setSelectedPermission] = React.useState<Permission | null>(null)
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  const handleCreateClick = () => {
    setSelectedPermission(null)
    onFormOpen()
  }

  const handleEditClick = (permission: Permission) => {
    setSelectedPermission(permission)
    onFormOpen()
  }

  const handleDeleteClick = (permission: Permission) => {
    setSelectedPermission(permission)
    onAlertOpen()
  }

  const confirmDelete = () => {
    if (selectedPermission) {
      deletePermissionMutation.mutate(selectedPermission.id, {
        onSuccess: () => {
          onAlertClose()
          setSelectedPermission(null)
        },
      })
    }
  }

  const handleFormSubmit = (data: PermissionRequest) => {
    if (selectedPermission) {
      updatePermissionMutation.mutate(
        { id: selectedPermission.id, data },
        { onSuccess: onFormClose },
      )
    } else {
      createPermissionMutation.mutate(data, { onSuccess: onFormClose })
    }
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={8}>
        <Heading as="h2" size="xl">
          Manage Permissions
        </Heading>
        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={handleCreateClick}>
          Create Permission
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
              <Th>Description</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.content.map((permission) => {
              const p: Permission = {
                id: permission.id ?? 0,
                name: permission.name,
                description: permission.description ?? undefined,
              }
              return (
              <Tr key={p.id}>
                <Td>{p.id}</Td>
                <Td>{p.name}</Td>
                <Td>{p.description}</Td>
                <Td>
                  <IconButton
                    aria-label="Edit permission"
                    icon={<EditIcon />}
                    mr={2}
                    onClick={() => handleEditClick(p)}
                  />
                  <IconButton
                    aria-label="Delete permission"
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    onClick={() => handleDeleteClick(p)}
                  />
                </Td>
              </Tr>
              )
            })}
          </Tbody>
        </Table>
      )}

      {data && (
        <Flex justify="center" mt={4} gap={4} align="center">
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
        </Flex>
      )}

      <Modal isOpen={isFormOpen} onClose={onFormClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedPermission ? 'Edit' : 'Create'} Permission</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <PermissionForm
              initialValues={
                selectedPermission
                  ? { name: selectedPermission.name, description: selectedPermission.description }
                  : undefined
              }
              onSubmit={handleFormSubmit}
              isSubmitting={
                createPermissionMutation.isPending || updatePermissionMutation.isPending
              }
            />
          </ModalBody>
          <ModalFooter>{/* The form has its own submit button */}</ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog isOpen={isAlertOpen} leastDestructiveRef={cancelRef} onClose={onAlertClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Permission
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
                isLoading={deletePermissionMutation.isPending}
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

export default PermissionsPage
