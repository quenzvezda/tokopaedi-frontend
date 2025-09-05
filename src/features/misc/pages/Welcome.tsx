import { Box, Heading, Text, Stack } from '@chakra-ui/react'

export default function Welcome() {
  return (
    <Box p={8}>
      <Stack spacing={2}>
        <Heading size="lg">Welcome</Heading>
        <Text>You're signed in. This is a placeholder page.</Text>
      </Stack>
    </Box>
  )
}

