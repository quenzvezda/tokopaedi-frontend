import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Text,
  Button,
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'

import { useGetUsers } from '../api/hooks'

export default function UsersPage() {
  const { data, isLoading, isError, error } = useGetUsers()

  return (
    <Box>
      <Heading as="h2" size="xl" mb={8}>
        Manage Users
      </Heading>
      {isLoading && <Spinner />}
      {isError && <Text color="red.500">Error: {error?.message}</Text>}
      {data && (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Username</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((user) => (
              <Tr key={user.id}>
                <Td>{user.id}</Td>
                <Td>{user.username}</Td>
                <Td>
                  <Button as={Link} to={`/admin/user/${user.id}/roles`} size="sm">
                    Roles
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  )
}
