import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Skeleton,
  Stack,
  Switch,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useState } from 'react'

import { toApiError, type ApiError } from '@/shared/lib/fetcher'

import { useUpdateStore } from '../api/hooks'

import type { StoreProfileDto } from '../services/profile.service'

type StoresSectionProps = {
  stores?: StoreProfileDto[]
  isLoading: boolean
  isError: boolean
  error?: ApiError | null
  onCreateStore: () => void
}

export default function StoresSection({ stores, isLoading, isError, error, onCreateStore }: StoresSectionProps) {
  const toast = useToast()
  const { mutateAsync: updateStore } = useUpdateStore()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function toggleActive(store: StoreProfileDto, next: boolean) {
    setUpdatingId(store.id)
    try {
      await updateStore({ storeId: store.id, input: { active: next } })
      toast({ title: 'Store updated', status: 'success' })
    } catch (err) {
      const { message } = toApiError(err)
      toast({ title: 'Update failed', description: message, status: 'error' })
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <HStack justify="space-between" align="center">
          <Text fontWeight="semibold">My Stores</Text>
          <Button size="sm" colorScheme="teal" onClick={onCreateStore}>
            New Store
          </Button>
        </HStack>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <Stack spacing={4}>
            {Array.from({ length: 2 }).map((_, idx) => (
              <Skeleton key={idx} height="80px" borderRadius="md" />
            ))}
          </Stack>
        ) : isError ? (
          <Box color="red.500">{error?.message ?? 'Failed to load stores'}</Box>
        ) : !stores || stores.length === 0 ? (
          <Box color="gray.500">You have no stores yet. Create one to start selling.</Box>
        ) : (
          <Stack spacing={4}>
            {stores.map((store) => (
              <Box
                key={store.id}
                borderWidth="1px"
                borderRadius="md"
                p={4}
                _hover={{ borderColor: 'teal.300' }}
                transition="border-color 0.2s"
              >
                <HStack justify="space-between" align="start" mb={2}>
                  <Stack spacing={1}>
                    <Text fontWeight="semibold">{store.name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {store.slug}
                    </Text>
                  </Stack>
                  <Badge colorScheme={store.active ? 'green' : 'gray'}>{store.active ? 'Active' : 'Inactive'}</Badge>
                </HStack>
                {store.description && (
                  <Text fontSize="sm" color="gray.600" mb={3}>
                    {store.description}
                  </Text>
                )}
                <HStack spacing={4}>
                  <Switch
                    colorScheme="teal"
                    isChecked={store.active}
                    onChange={(e) => toggleActive(store, e.target.checked)}
                    isDisabled={updatingId === store.id}
                  />
                  <Text fontSize="sm" color="gray.600">
                    {store.active ? 'Store is visible to buyers' : 'Store is hidden'}
                  </Text>
                </HStack>
              </Box>
            ))}
          </Stack>
        )}
      </CardBody>
    </Card>
  )
}
