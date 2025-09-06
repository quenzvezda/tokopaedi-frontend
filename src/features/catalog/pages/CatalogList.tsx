import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Image,
  Input,
  Skeleton,
  Stack,
  Text,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react'
import React from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'

import { useCurrentUser, useLogout } from '@/features/auth/api/hooks'
import useAuth from '@/features/auth/useAuth'

import { useListProducts } from '../api/hooks'

function Header() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const { isOpen, onOpen, onClose } = useDisclosure()
  const logout = useLogout()
  const user = useCurrentUser()
  const { isAuthenticated } = useAuth()
  const closeTimer = React.useRef<number | null>(null)

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const openOnHover = () => {
    clearCloseTimer()
    onOpen()
  }

  const scheduleClose = () => {
    clearCloseTimer()
    closeTimer.current = window.setTimeout(() => onClose(), 200)
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const nextQ = String(fd.get('q') || '')
    const next = new URLSearchParams(searchParams)
    if (nextQ) next.set('q', nextQ)
    else next.delete('q')
    next.set('page', '0')
    setSearchParams(next)
  }

  return (
    <Box as="header" position="sticky" top={0} zIndex={1} bg="white" boxShadow="sm">
      <Flex align="center" justify="space-between" px={6} py={3}>
        <HStack spacing={3}>
          <Image src="/vite.svg" alt="logo" boxSize="28px" />
          <Heading size="md">Tokopaedi</Heading>
        </HStack>
        <Box as="form" onSubmit={onSubmit} minW={{ base: '40%', md: '50%' }}>
          <Input name="q" placeholder="Search products" defaultValue={q} bg="gray.50" />
        </Box>
        <Box>
          {isAuthenticated ? (
            <Menu isOpen={isOpen} closeOnBlur={false}>
              <MenuButton onMouseEnter={openOnHover} onMouseLeave={scheduleClose}>
                <Avatar size="sm" name={user.data?.username || 'User'} />
              </MenuButton>
              <MenuList onMouseEnter={openOnHover} onMouseLeave={scheduleClose}>
                <Box px={3} py={2}>
                  <HStack>
                    <Avatar size="sm" name={user.data?.username || 'User'} />
                    <Box>
                      <Text fontWeight="semibold">{user.data?.username || 'User'}</Text>
                      {user.data?.email && (
                        <Text fontSize="sm" color="gray.500">{user.data.email}</Text>
                      )}
                    </Box>
                  </HStack>
                </Box>
                <MenuDivider />
                <MenuItem isDisabled>Profile</MenuItem>
                <MenuItem isDisabled>Orders</MenuItem>
                <MenuItem isDisabled>Settings</MenuItem>
                <MenuItem onClick={() => logout.mutate()}>Logout</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <HStack>
              <Button as={RouterLink} to="/login" variant="outline" size="sm">
                Login
              </Button>
              <Button as={RouterLink} to="/register" colorScheme="teal" size="sm">
                Register
              </Button>
            </HStack>
          )}
        </Box>
      </Flex>
    </Box>
  )
}

function Footer() {
  return (
    <Box as="footer" py={8} textAlign="center" color="gray.500">
      <Text fontSize="sm">Tokopaedi — A demo storefront</Text>
    </Box>
  )
}

function ProductCard({ name, price }: { name: string; price?: number }) {
  return (
    <Card _hover={{ boxShadow: 'md' }} transition="box-shadow 0.2s">
      <Image src="/vite.svg" alt={name} objectFit="contain" h="120px" mt={4} />
      <CardHeader>
        <Heading size="sm" noOfLines={2}>
          {name}
        </Heading>
      </CardHeader>
      <CardBody pt={0}>
        <Text fontWeight="bold">{typeof price === 'number' ? `Rp ${price.toLocaleString('id-ID')}` : '—'}</Text>
      </CardBody>
    </Card>
  )
}

export default function CatalogList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? undefined
  const brandId = searchParams.get('brandId') ?? undefined
  const categoryId = searchParams.get('categoryId') ?? undefined
  const page = Number(searchParams.get('page') ?? '0')
  const size = Number(searchParams.get('size') ?? '12')

  const { data, isLoading, isError, error, isFetching } = useListProducts({ q, brandId, categoryId, page, size })

  function goPage(p: number) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(p))
    setSearchParams(next)
  }

  return (
    <Flex direction="column" minH="100vh">
      <Header />
      <Box as="main" flex={1} px={6} py={6}>
        <Stack spacing={4}>
          <HStack justify="space-between">
            <Heading size="lg">Products</Heading>
            {isFetching && <Text fontSize="sm" color="gray.500">Refreshing…</Text>}
          </HStack>

          {isLoading ? (
            <Grid templateColumns="repeat(4, 1fr)" gap={4}>
              {Array.from({ length: 8 }).map((_, i) => (
                <GridItem key={i}>
                  <Card>
                    <Skeleton height="160px" />
                    <CardBody>
                      <Skeleton height="16px" mb={2} />
                      <Skeleton height="14px" width="50%" />
                    </CardBody>
                  </Card>
                </GridItem>
              ))}
            </Grid>
          ) : isError ? (
            <Center py={20}>
              <Stack spacing={2} align="center">
                <Heading size="md">Error</Heading>
                <Text color="red.500">{error?.message || 'Failed to load products'}</Text>
                <Button onClick={() => goPage(page)}>Retry</Button>
              </Stack>
            </Center>
          ) : data && data.items.length === 0 ? (
            <Center py={20}>
              <Stack spacing={2} align="center">
                <Heading size="md">No products</Heading>
                <Text color="gray.500">Try adjusting your filters</Text>
              </Stack>
            </Center>
          ) : (
            <>
              <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4}>
                {data?.items.map((p) => (
                  <GridItem key={p.id}>
                    <ProductCard name={p.name} price={p.price} />
                  </GridItem>
                ))}
              </Grid>
              <HStack justify="center" mt={4} spacing={4}>
                <Button onClick={() => goPage(Math.max(0, page - 1))} isDisabled={page <= 0}>
                  Previous
                </Button>
                <Text>
                  Page {page + 1} of {data?.totalPages ?? 1}
                </Text>
                <Button
                  onClick={() => goPage(Math.min((data?.totalPages ?? 1) - 1, page + 1))}
                  isDisabled={page + 1 >= (data?.totalPages ?? 1)}
                >
                  Next
                </Button>
              </HStack>
            </>
          )}
        </Stack>
      </Box>
      <Footer />
    </Flex>
  )
}
