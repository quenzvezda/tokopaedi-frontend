import { AddIcon, SearchIcon } from '@chakra-ui/icons'
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
  InputLeftElement,
  InputRightElement,
  Skeleton,
  Center,
  Stack,
  CloseButton,
} from '@chakra-ui/react'
import React from 'react'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
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

  // Interpret default sort internally (do not write to URL)
  const defaultSortField: 'id' | 'name' = 'name'
  const defaultSortDir: 'asc' | 'desc' = 'asc'
  const hasSortParam = Boolean(sortParam)
  const effectiveSortField = (hasSortParam ? sortField : defaultSortField) as 'id' | 'name'
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

  function toggleSort(field: 'id' | 'name') {
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

  const totalCount = data?.totalElements ?? data?.content.length ?? 0
  const resultsLabel = totalCount === 1 ? 'result' : 'results'

  return (
    <Box>
      <Stack spacing={4} mb={4}>
        <Heading as="h2" size="lg">
          Manage Roles
        </Heading>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'stretch', md: 'center' }}
          gap={3}
        >
          <Box
            as="form"
            onSubmit={onSubmit}
            flex={{ base: 1, md: '1 1 320px' }}
            maxW={{ base: 'full', md: '360px' }}
          >
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none" color="gray.400">
                <SearchIcon boxSize={3} />
              </InputLeftElement>
              <Input
                placeholder="Cari nama, kode, atau deskripsi"
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                aria-label="Search roles"
                bg="white"
                boxShadow="sm"
              />
              {qInput && (
                <InputRightElement width="2.5rem">
                  <CloseButton size="sm" onClick={() => setQInput('')} aria-label="Clear search" />
                </InputRightElement>
              )}
            </InputGroup>
          </Box>
          <Flex
            flex={{ base: 1, md: '1 1 auto' }}
            justify={{ base: 'flex-start', md: 'center' }}
            align="center"
            minH="32px"
          >
            {data && (
              <Text fontSize="sm" color="gray.600">
                {totalCount} {resultsLabel}
                {qParam ? ` untuk "${qParam}"` : ''}
              </Text>
            )}
          </Flex>
          <Button
            leftIcon={<AddIcon boxSize={3} />}
            colorScheme="teal"
            onClick={onCreateOpen}
            alignSelf={{ base: 'stretch', md: 'auto' }}
          >
            Create Role
          </Button>
        </Flex>
      </Stack>

      {isLoading ? (
        <Table
          variant="striped"
          colorScheme="gray"
          size="sm"
          sx={{
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
            'tbody tr:hover td': { bg: 'gray.100' },
          }}
        >
          <Thead>
            <Tr>
              <Th textAlign="right" width="6ch">
                ID
              </Th>
              <Th width="240px">Name</Th>
              <Th textAlign="right" width="220px">
                Actions
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <Tr key={i}>
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
          <Table
            variant="striped"
            colorScheme="gray"
            size="sm"
            sx={{
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
              'tbody tr:hover td': { bg: 'teal.50' },
            }}
          >
            <Thead>
              <Tr>
                <Th
                  onClick={() => toggleSort('id')}
                  cursor="pointer"
                  aria-sort={sortField === 'id' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  textAlign="right"
                  width="6ch"
                >
                  ID {sortField === 'id' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </Th>
                <Th
                  onClick={() => toggleSort('name')}
                  cursor="pointer"
                  aria-sort={sortField === 'name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  width="240px"
                >
                  Name {sortField === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </Th>
                <Th textAlign="right" width="220px">
                  Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.content.map((role) => {
                const r: Role = { id: role.id ?? 0, name: role.name }
                return (
                  <Tr key={role.id}>
                    <Td textAlign="right" fontWeight="semibold" width="6ch">
                      {r.id}
                    </Td>
                    <Td>
                      <Text fontFamily="mono" fontWeight="medium">
                        {r.name}
                      </Text>
                    </Td>
                    <Td textAlign="right">
                      <HStack spacing={2} justify="flex-end">
                        <Button
                          as={Link}
                          to={`/admin/role/${r.id}/assign`}
                          size="sm"
                          variant="outline"
                          colorScheme="teal"
                          leftIcon={<AddIcon boxSize={3} />}
                        >
                          Permissions
                        </Button>
                        <IconButton
                          aria-label="Edit role"
                          icon={<FiEdit2 />}
                          variant="ghost"
                          colorScheme="gray"
                          onClick={() => handleEditClick(r)}
                          size="sm"
                        />
                        <IconButton
                          aria-label="Delete role"
                          icon={<FiTrash2 />}
                          variant="outline"
                          colorScheme="red"
                          onClick={() => handleDeleteClick(r)}
                          size="sm"
                        />
                      </HStack>
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
