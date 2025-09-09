import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import React from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'

import { useCurrentUser, useLogout } from '@/features/auth/api/hooks'
import useAuth from '@/features/auth/useAuth'

export function Header({ showSearchBar = true }: { showSearchBar?: boolean }) {
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
          <RouterLink to="/">
            <Image src="/vite.svg" alt="logo" boxSize="28px" />
          </RouterLink>
          <Heading size="md">Tokopaedi</Heading>
        </HStack>
        {showSearchBar && (
          <Box as="form" onSubmit={onSubmit} minW={{ base: '40%', md: '50%' }}>
            <Input name="q" placeholder="Search products" defaultValue={q} bg="gray.50" />
          </Box>
        )}
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
                        <Text fontSize="sm" color="gray.500">
                          {user.data.email}
                        </Text>
                      )}
                    </Box>
                  </HStack>
                </Box>
                <MenuDivider />
                {user.data?.roles?.includes('ADMIN') && (
                  <MenuItem as={RouterLink} to="/admin">
                    Admin Panel
                  </MenuItem>
                )}
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

export function Footer() {
  return (
    <Box as="footer" py={8} textAlign="center" color="gray.500">
      <Text fontSize="sm">Tokopaedi — A demo storefront</Text>
    </Box>
  )
}
