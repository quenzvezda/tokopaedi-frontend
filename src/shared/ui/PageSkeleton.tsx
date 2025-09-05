import { Center, Spinner } from '@chakra-ui/react'

export function PageSkeleton() {
  return (
    <Center minH="60vh">
      <Spinner />
    </Center>
  )
}

export default PageSkeleton
