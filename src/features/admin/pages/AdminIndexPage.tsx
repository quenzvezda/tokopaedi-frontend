import { Box, Heading, Text } from '@chakra-ui/react'

const AdminIndexPage = () => {
  return (
    <Box>
      <Heading as="h2" size="xl" mb={4}>
        Welcome to the Admin Panel
      </Heading>
      <Text>Please select a section from the sidebar to get started.</Text>
    </Box>
  )
}

export default AdminIndexPage
