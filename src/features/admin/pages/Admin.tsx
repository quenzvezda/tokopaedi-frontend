import { Box, Heading, Stack, Text } from '@chakra-ui/react'

export default function Admin() {
  return (
    <Box p={8}>
      <Stack spacing={2}>
        <Heading size="lg">Admin</Heading>
        <Text>Restricted area. Admins only.</Text>
      </Stack>
    </Box>
  )
}

