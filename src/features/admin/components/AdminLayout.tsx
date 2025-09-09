import { Box, Flex, VStack, Link as ChakraLink, Heading, Divider } from '@chakra-ui/react'
import { NavLink, Outlet } from 'react-router-dom'

const AdminLayout = () => {
  return (
    <Flex height="100vh">
      <Box as="nav" width="250px" bg="gray.100" p={4}>
        <Heading as="h1" size="lg" mb={8}>
          Admin Panel
        </Heading>
        <VStack align="stretch" spacing={4}>
          <ChakraLink as={NavLink} to="/admin/roles" _activeLink={{ fontWeight: 'bold' }}>
            Roles
          </ChakraLink>
          <ChakraLink as={NavLink} to="/admin/permissions" _activeLink={{ fontWeight: 'bold' }}>
            Permissions
          </ChakraLink>
          <ChakraLink isDisabled>Users</ChakraLink>
        </VStack>
      </Box>
      <Divider orientation="vertical" />
      <Box as="main" flex="1" p={8}>
        <Outlet />
      </Box>
    </Flex>
  )
}

export default AdminLayout
