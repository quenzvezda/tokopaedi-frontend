import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  VStack,
  Link as ChakraLink,
  Heading,
  IconButton,
  Icon,
  Text,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react'
import { NavLink, Outlet } from 'react-router-dom'

import { Header, Footer } from '@/shared/ui/PageLayout'
import { FiKey, FiShield, FiUsers } from 'react-icons/fi'

const AdminLayout = () => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true })
  const sidebarWidth = isOpen ? 260 : 72

  const navItems = [
    { label: 'Users', to: '/admin/users', icon: FiUsers },
    { label: 'Roles', to: '/admin/roles', icon: FiShield },
    { label: 'Permissions', to: '/admin/permissions', icon: FiKey },
  ]

  const toggleIcon = isOpen ? <ChevronLeftIcon boxSize={4} /> : <ChevronRightIcon boxSize={4} />
  const toggleLabel = isOpen ? 'Collapse sidebar' : 'Expand sidebar'

  return (
    <Flex direction="column">
      <Header showSearchBar={false} />
      <Flex flex="1" minH="calc(100vh + 1px)" position="relative">
        <Box
          as="nav"
          width={`${sidebarWidth}px`}
          bg="gray.50"
          borderRightWidth="1px"
          borderRightColor="gray.200"
          p={4}
          display="flex"
          flexDirection="column"
          gap={6}
          transition="width 0.2s ease"
        >
          <Flex align="center" justify="space-between" w="full">
            {isOpen ? (
              <Heading as="h1" size="md" noOfLines={1}>
                Admin Panel
              </Heading>
            ) : (
              <Icon as={FiShield} boxSize={5} color="teal.500" />
            )}
            <IconButton
              aria-label={toggleLabel}
              icon={toggleIcon}
              onClick={onToggle}
              variant="ghost"
              size="sm"
            />
          </Flex>
          <VStack align="stretch" spacing={2} flex="1">
            {navItems.map((item) => (
              <Tooltip
                key={item.to}
                label={item.label}
                placement="right"
                openDelay={200}
                isDisabled={isOpen}
              >
                <ChakraLink
                  as={NavLink}
                  to={item.to}
                  display="flex"
                  alignItems="center"
                  gap={isOpen ? 3 : 0}
                  justifyContent={isOpen ? 'flex-start' : 'center'}
                  px={isOpen ? 3 : 0}
                  py={2}
                  borderRadius="md"
                  borderLeftWidth="3px"
                  borderLeftColor="transparent"
                  color="gray.600"
                  fontWeight="medium"
                  _hover={{ bg: 'gray.100', color: 'teal.600' }}
                  _activeLink={{
                    bg: 'teal.50',
                    color: 'teal.700',
                    borderLeftColor: 'teal.400',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
                  }}
                >
                  <Icon as={item.icon} boxSize={5} />
                  {isOpen && <Text>{item.label}</Text>}
                </ChakraLink>
              </Tooltip>
            ))}
          </VStack>
        </Box>
        <Box flex="1" p={8}>
          <Outlet />
        </Box>
      </Flex>
      <Footer />
    </Flex>
  )
}

export default AdminLayout
