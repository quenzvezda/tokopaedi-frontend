import { SearchIcon } from '@chakra-ui/icons'
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  CloseButton,
  Stack,
  Skeleton,
  Center,
  HStack,
} from '@chakra-ui/react'
import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { useGetUsers } from '../api/hooks'

const DEFAULT_PAGE_SIZE = 12
const SORT_ASC_TOKEN = ''
const SORT_DESC_TOKEN = ''

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

export default function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rawPage = Number.parseInt(searchParams.get('page') ?? '0', 10)
  const page = Number.isNaN(rawPage) || rawPage < 0 ? 0 : rawPage
  const rawSize = Number.parseInt(searchParams.get('size') ?? String(DEFAULT_PAGE_SIZE), 10)
  const size = Number.isNaN(rawSize) || rawSize <= 0 ? DEFAULT_PAGE_SIZE : rawSize
  const qParam = searchParams.get('q') ?? ''
  const sortParam = searchParams.getAll('sort')[0] ?? ''
  const [rawSortField, rawSortDir] = sortParam.split(',')
  const isSortFieldValid = rawSortField === 'id' || rawSortField === 'username'
  const sortField: 'id' | 'username' | undefined = isSortFieldValid
    ? (rawSortField as 'id' | 'username')
    : undefined
  const sortDir: 'asc' | 'desc' = rawSortDir === 'desc' ? 'desc' : 'asc'
  const hasSortParam = Boolean(sortParam) && sortField !== undefined
  const effectiveSortField: 'id' | 'username' = sortField ?? 'username'
  const effectiveSortDir: 'asc' | 'desc' = hasSortParam ? sortDir : 'asc'
  const sortArgs = hasSortParam && sortField ? [`${sortField},${effectiveSortDir}`] : undefined

  const [qInput, setQInput] = React.useState(qParam)

  React.useEffect(() => {
    setQInput(qParam)
  }, [qParam])

  React.useEffect(() => {
    const trimmed = qInput.trim()
    const current = qParam.trim()
    const shouldUpdate =
      (trimmed.length >= 2 && trimmed !== current) || (trimmed.length < 2 && qParam.length > 0)
    if (!shouldUpdate) return

    const handle = window.setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (trimmed.length >= 2) next.set('q', trimmed)
        else next.delete('q')
        next.set('page', '0')
        next.set('size', String(size))
        return next
      })
    }, 400)

    return () => window.clearTimeout(handle)
  }, [qInput, qParam, setSearchParams, size])

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = qInput.trim()
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (trimmed.length >= 2) next.set('q', trimmed)
      else next.delete('q')
      next.set('page', '0')
      next.set('size', String(size))
      return next
    })
  }

  function clearSearch() {
    setQInput('')
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('q')
      next.set('page', '0')
      next.set('size', String(size))
      return next
    })
  }

  function setPageIndex(nextPage: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(Math.max(0, nextPage)))
      next.set('size', String(size))
      return next
    })
  }

  function toggleSort(field: 'id' | 'username') {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (effectiveSortField !== field) {
        next.delete('sort')
        next.append('sort', `${field},asc`)
      } else {
        if (effectiveSortDir === 'asc') next.set('sort', `${field},desc`)
        else if (effectiveSortDir === 'desc') next.delete('sort')
        else next.set('sort', `${field},asc`)
      }
      next.set('page', '0')
      next.set('size', String(size))
      return next
    })
  }

  const { data, isLoading, isError, error, isFetching, refetch } = useGetUsers({
    page,
    size,
    q: qParam || undefined,
    sort: sortArgs,
  })

  const totalPages = data?.totalPages && data.totalPages > 0 ? data.totalPages : 1
  const totalCount = data?.totalElements ?? data?.content.length ?? 0

  return (
    <Box>
      <Heading as="h2" size="xl" mb={8}>
        Manage Users
      </Heading>
      <Stack spacing={6}>
        <Flex align="center" justify="space-between" gap={4} wrap="wrap">
          <Box flex="1" minW="260px">
            <form onSubmit={onSubmit}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" boxSize={4} />
                </InputLeftElement>
                <Input
                  value={qInput}
                  onChange={(event) => setQInput(event.target.value)}
                  placeholder="Cari username..."
                  variant="filled"
                  bg="gray.50"
                  _hover={{ bg: 'gray.100' }}
                />
                {qInput ? (
                  <InputRightElement>
                    <CloseButton size="sm" onClick={clearSearch} aria-label="Clear search" />
                  </InputRightElement>
                ) : null}
              </InputGroup>
            </form>
            <Text fontSize="sm" color="gray.500" mt={2}>
              {qParam ? `Filter: ${qParam}` : 'Minimal 2 karakter untuk mencari'}
            </Text>
          </Box>
          <Text fontSize="sm" color="gray.600">
            Total pengguna: {totalCount}
          </Text>
        </Flex>

        {isLoading ? (
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
                <Th>Username</Th>
                <Th textAlign="right" width="200px">
                  Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {Array.from({ length: 5 }).map((_, index) => (
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
        ) : isError ? (
          <Center py={10}>
            <Stack spacing={2} align="center">
              <Heading size="md">Error</Heading>
              <Text color="red.500">{error?.message || 'Failed to load users'}</Text>
              <Button onClick={() => refetch()}>Retry</Button>
            </Stack>
          </Center>
        ) : data && data.content.length === 0 ? (
          <Center py={10}>
            <Stack spacing={2} align="center">
              <Heading size="md">Tidak ada hasil</Heading>
              <Text color="gray.500">
                {qParam ? `Tidak ada pengguna untuk '${qParam}'` : 'Pengguna belum tersedia'}
              </Text>
            </Stack>
          </Center>
        ) : (
          data && (
            <Table
              variant="striped"
              colorScheme="gray"
              size="sm"
              sx={{ ...baseTableStyles, 'tbody tr:hover td': { bg: 'teal.50' } }}
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
                    ID {sortField === 'id' ? (sortDir === 'asc' ? SORT_ASC_TOKEN : SORT_DESC_TOKEN) : ''}
                  </Th>
                  <Th
                    onClick={() => toggleSort('username')}
                    cursor="pointer"
                    aria-sort={sortField === 'username' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    Username {sortField === 'username' ? (sortDir === 'asc' ? SORT_ASC_TOKEN : SORT_DESC_TOKEN) : ''}
                  </Th>
                  <Th textAlign="right" width="200px">
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.content.map((user) => (
                  <Tr key={user.id}>
                    <Td textAlign="right" fontWeight="semibold" width="6ch">
                      {user.id}
                    </Td>
                    <Td>
                      <Text fontFamily="mono" fontWeight="medium">
                        {user.username}
                      </Text>
                    </Td>
                    <Td textAlign="right">
                      <Button
                        as={Link}
                        to={`/admin/user/${user.id}/roles`}
                        size="sm"
                        variant="outline"
                        colorScheme="teal"
                      >
                        Roles
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )
        )}

        {data && data.content.length > 0 && (
          <HStack justify="center" mt={4} spacing={4}>
            <Button onClick={() => setPageIndex(page - 1)} isDisabled={page <= 0}>
              Previous
            </Button>
            <Text>
              Page {page + 1} of {totalPages}
              {isFetching ? ' - Refreshing' : ''}
            </Text>
            <Button
              onClick={() => setPageIndex(Math.min(totalPages - 1, page + 1))}
              isDisabled={page + 1 >= totalPages}
            >
              Next
            </Button>
          </HStack>
        )}
      </Stack>
    </Box>
  )
}
