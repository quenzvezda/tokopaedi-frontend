import { Box, Flex, VStack, Link as ChakraLink, Heading, Divider, Text } from '@chakra-ui/react'
import { NavLink, Outlet } from 'react-router-dom'

import { Header, Footer } from '@/shared/ui/PageLayout'

const AdminLayout = () => {
  return (
    <Flex direction="column" minH="100vh">
      <Header showSearchBar={false} />
      <Flex flex="1">
        <Box as="nav" width="250px" bg="gray.100" p={4}>
          <Heading as="h1" size="lg" mb={8}>
            Admin Panel
          </Heading>
          <VStack align="stretch" spacing={4}>
            <Text color="gray.500" cursor="not-allowed">
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
        <Divider orientation="vertical" />
        <Box as="main" flex="1" p={8}>
          <Outlet />
        </Box>
      </Flex>
      <Footer />
    </Flex>
  )
}

export default AdminLayout
