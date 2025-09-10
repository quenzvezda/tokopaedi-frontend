import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  VStack,
  Link as ChakraLink,
  Heading,
  Text,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react'
import { NavLink, Outlet } from 'react-router-dom'

import { Header, Footer } from '@/shared/ui/PageLayout'

const AdminLayout = () => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true })

  return (
    <Flex direction="column">
      <Header showSearchBar={false} />
      <Flex flex="1" minH="calc(100vh + 1px)" position="relative">
        {isOpen && (
          <Box as="nav" width="250px" bg="gray.100" p={4} position="relative">
            <Heading as="h1" size="lg" mb={8}>
              Admin Panel
            </Heading>
            <VStack align="stretch" spacing={4}>
              <Text color="gray.400" cursor="not-allowed">
                Users
              </Text>
              <ChakraLink as={NavLink} to="/admin/roles" _activeLink={{ fontWeight: 'bold' }}>
                Roles
              </ChakraLink>
              <ChakraLink as={NavLink} to="/admin/permissions" _activeLink={{ fontWeight: 'bold' }}>
                Permissions
              </ChakraLink>
            </VStack>
            <IconButton
              aria-label="Toggle navigation"
              icon={<CloseIcon />}
              onClick={onToggle}
              position="absolute"
              top="50%"
              right="-3"
              transform="translateY(-50%)"
              size="sm"
            />
          </Box>
        )}
        {!isOpen && (
          <IconButton
            aria-label="Toggle navigation"
            icon={<HamburgerIcon />}
            onClick={onToggle}
            position="absolute"
            top="50%"
            left="0"
            transform="translateY(-50%)"
            size="sm"
          />
        )}
        <Box flex="1" p={8}>
          <Outlet />
        </Box>
      </Flex>
      <Footer />
    </Flex>
  )
}

export default AdminLayout
