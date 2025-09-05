import { Center, Text } from '@chakra-ui/react'

export function EmptyState({ message = 'No data to display' }: { message?: string }) {
  return (
    <Center minH="40vh">
      <Text color="gray.500">{message}</Text>
    </Center>
  )
}

export default EmptyState
