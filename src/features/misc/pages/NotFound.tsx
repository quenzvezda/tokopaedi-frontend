import { Box, Heading, Text, Stack } from '@chakra-ui/react'

export default function NotFound() {
  return (
    <Box p={8}>
      <Stack spacing={2}>
        <Heading size="lg">404 - Not Found</Heading>
        <Text>The page you are looking for does not exist.</Text>
      </Stack>
    </Box>
  )
}

