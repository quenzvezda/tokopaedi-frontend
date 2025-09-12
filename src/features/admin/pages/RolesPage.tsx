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
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Skeleton,
  Center,
  Stack,
} from '@chakra-ui/react'
import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { useDeleteRole, useGetRoles } from '../api/hooks'
import { CreateRoleModal } from '../components/CreateRoleModal'
import { EditRoleModal } from '../components/EditRoleModal'

import type { Role } from '../types'

function RoleManagement() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? '0')
  const size = Number(searchParams.get('size') ?? '12')
  const qParam = searchParams.get('q') ?? ''
  const sortParam = searchParams.getAll('sort')[0] ?? ''

  const [qInput, setQInput] = React.useState(qParam)

  const sortParts = (sortParam || '').split(',')
  const sortField = sortParts[0] || ''
  const sortDir = (sortParts[1] as 'asc' | 'desc' | undefined) || 'asc'

  const { data, isLoading, isError, error, isFetching, refetch } = useGetRoles({
    page,
    size,
    q: qParam || undefined,
    sort: sortParam ? [sortParam] : undefined,
  })
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

  // Ensure default sort is present in URL for stable sorting and predictable toggling
  React.useEffect(() => {
    if (!sortParam) {
      const next = new URLSearchParams(searchParams)
      next.set('sort', 'name,asc')
      setSearchParams(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortParam])

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

  function toggleSort(field: 'id' | 'name') {
    const next = new URLSearchParams(searchParams)
    if (sortField !== field) {
      next.delete('sort')
      next.append('sort', `${field},asc`)
    } else {
      if (sortDir === 'asc') next.set('sort', `${field},desc`)
      else if (sortDir === 'desc') next.delete('sort')
      else next.set('sort', `${field},asc`)
    }
    next.set('page', '0')
    setSearchParams(next)
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h2" size="xl">
          Manage Roles
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
          <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={onCreateOpen}>
            Create Role
          </Button>
        </HStack>
      </Flex>

      {isLoading ? (
        <Table variant="simple" size="sm" sx={{ 'th, td': { py: 1, px: 2, fontSize: 'sm' } }}>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <Tr key={i}>
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
            <Text color="red.500">{error?.message || 'Failed to load roles'}</Text>
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
        )
      )}

      {data && (
        <HStack justify="center" mt={4} spacing={4}>
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
