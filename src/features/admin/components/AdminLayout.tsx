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
    <Flex direction="column" minH="100vh">
      <Header showSearchBar={false} />
      <Flex flex="1">
        {isOpen && (
          <Box as="nav" width="250px" bg="gray.100" p={4}>
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
          </Box>
        )}
        <Box flex="1" p={8}>
          <IconButton
            aria-label="Toggle navigation"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            onClick={onToggle}
            mb={4}
          />
          <Outlet />
        </Box>
      </Flex>
      <Footer />
    </Flex>
  )
}

export default AdminLayout
