import { Button, Center, Stack, Text } from '@chakra-ui/react'

export function ErrorState({ message = 'Something went wrong', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <Center minH="40vh">
      <Stack spacing={3} align="center">
        <Text color="red.500" fontWeight="medium">
          {message}
        </Text>
        {onRetry && (
          <Button colorScheme="red" onClick={onRetry} size="sm">
            Retry
          </Button>
        )}
      </Stack>
    </Center>
  )
}

export default ErrorState
