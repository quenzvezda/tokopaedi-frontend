import { Box, Heading, Text, Stack } from '@chakra-ui/react'

export default function Forbidden() {
  return (
    <Box p={8}>
      <Stack spacing={2}>
        <Heading size="lg">403 - Forbidden</Heading>
        <Text>You don't have permission to access this page.</Text>
      </Stack>
    </Box>
  )
}

