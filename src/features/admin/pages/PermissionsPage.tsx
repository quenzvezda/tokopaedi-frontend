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
  Input,
  InputGroup,
  InputRightElement,
  Center,
  HStack,
  Stack,
  Skeleton,
} from '@chakra-ui/react'
import React from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  useGetPermissions,
  useDeletePermission,
  useCreatePermission,
  useUpdatePermission,
} from '../api/hooks'
import { PermissionForm } from '../components/PermissionForm'

import type { Permission, PermissionRequest } from '../types'

const PermissionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? '0')
  const size = Number(searchParams.get('size') ?? '12')
  const qParam = searchParams.get('q') ?? ''
  const sortParam = searchParams.getAll('sort')[0] ?? ''

  const [qInput, setQInput] = React.useState(qParam)

  const sortParts = (sortParam || '').split(',')
  const sortField = sortParts[0] || ''
  const sortDir = (sortParts[1] as 'asc' | 'desc' | undefined) || 'asc'

  const { data, isLoading, isError, error, isFetching, refetch } = useGetPermissions({
    page,
    size,
    q: qParam || undefined,
    sort: sortParam ? [sortParam] : undefined,
  })
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

  React.useEffect(() => {
    const h = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams)
      const trimmed = qInput.trim()
      if (trimmed.length >= 2) next.set('q', trimmed)
      else next.delete('q')
      next.set('page', '0')
      setSearchParams(next)
    }, 400)
    return () => window.clearTimeout(h)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput])

  // Interpret default sort internally (do not write to URL)
  const defaultSortField: 'id' | 'name' | 'description' = 'name'
  const defaultSortDir: 'asc' | 'desc' = 'asc'
  const hasSortParam = Boolean(sortParam)
  const effectiveSortField = (
    hasSortParam ? (sortField as 'id' | 'name' | 'description') : defaultSortField
  )
  const effectiveSortDir = hasSortParam ? sortDir : defaultSortDir

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const next = new URLSearchParams(searchParams)
    const trimmed = qInput.trim()
    if (trimmed.length >= 2) next.set('q', trimmed)
    else next.delete('q')
    next.set('page', '0')
    setSearchParams(next)
  }

  function setPage(p: number) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(p))
    setSearchParams(next)
  }

  function toggleSort(field: 'id' | 'name' | 'description') {
    const next = new URLSearchParams(searchParams)
    if (effectiveSortField !== field) {
      next.delete('sort')
      next.append('sort', `${field},asc`)
    } else {
      if (effectiveSortDir === 'asc') next.set('sort', `${field},desc`)
      else if (effectiveSortDir === 'desc') next.delete('sort')
      else next.set('sort', `${field},asc`)
    }
    next.set('page', '0')
    setSearchParams(next)
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h2" size="xl">
          Manage Permissions
        </Heading>
        <HStack>
          <Box as="form" onSubmit={onSubmit}>
            <InputGroup>
              <Input
                placeholder="Cari nama/kode/deskripsi..."
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                aria-label="Search"
                size="sm"
                bg="gray.50"
              />
              {qInput && (
                <InputRightElement width="3rem">
                  <Button size="xs" onClick={() => setQInput('')} aria-label="Clear search">
                    ✕
                  </Button>
                </InputRightElement>
              )}
            </InputGroup>
          </Box>
          <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={handleCreateClick}>
            Create Permission
          </Button>
        </HStack>
      </Flex>

      {isLoading ? (
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
            {Array.from({ length: 5 }).map((_, i) => (
              <Tr key={i}>
                <Td><Skeleton height="16px" /></Td>
                <Td><Skeleton height="16px" /></Td>
                <Td><Skeleton height="16px" /></Td>
                <Td><Skeleton height="16px" /></Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : isError ? (
        <Center py={10}>
          <Stack spacing={2} align="center">
            <Heading size="md">Error</Heading>
            <Text color="red.500">{error?.message || 'Failed to load permissions'}</Text>
            <Button onClick={() => refetch()}>Retry</Button>
          </Stack>
        </Center>
      ) : data && data.content.length === 0 ? (
        <Center py={10}>
          <Stack spacing={2} align="center">
            <Heading size="md">Tidak ada hasil</Heading>
            <Text color="gray.500">
              {qParam ? `Tidak ada hasil untuk '${qParam}'` : 'Coba ubah pencarian Anda'}
            </Text>
          </Stack>
        </Center>
      ) : (
        data && (
          <Table variant="simple" size="sm" sx={{ 'th, td': { py: 1, px: 2, fontSize: 'sm' } }}>
            <Thead>
              <Tr>
                <Th
                  onClick={() => toggleSort('id')}
                  cursor="pointer"
                  aria-sort={sortField === 'id' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  ID {sortField === 'id' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </Th>
                <Th
                  onClick={() => toggleSort('name')}
                  cursor="pointer"
                  aria-sort={sortField === 'name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Name {sortField === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </Th>
                <Th
                  onClick={() => toggleSort('description')}
                  cursor="pointer"
                  aria-sort={
                    sortField === 'description' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
                  }
                >
                  Description {sortField === 'description' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </Th>
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
        )
      )}

      {data && (
        <Flex justify="center" mt={4} gap={4} align="center">
          <Button onClick={() => setPage(Math.max(0, page - 1))} isDisabled={page <= 0}>
            Previous
          </Button>
          <Text>
            Page {page + 1} of {data.totalPages ?? 1}
            {isFetching ? ' • Refreshing' : ''}
          </Text>
          <Button
            onClick={() => setPage(Math.min((data.totalPages ?? 1) - 1, page + 1))}
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
