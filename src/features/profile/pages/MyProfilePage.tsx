import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Flex,
  Heading,
  Spinner,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'

import { useCurrentUser } from '@/features/auth/api/hooks'
import { Footer, Header } from '@/shared/ui/PageLayout'

import {
  useAvatarViewUrl,
  useMyProfile,
  useMyStores,
} from '../api/hooks'
import CreateStoreModal from '../components/CreateStoreModal'
import ProfileDetailsCard from '../components/ProfileDetailsCard'
import StoresSection from '../components/StoresSection'

export default function MyProfilePage() {
  const profileQuery = useMyProfile()
  const profile = profileQuery.data
  const avatarQuery = useAvatarViewUrl(profile?.avatarObjectKey ?? null)
  const { data: currentUser } = useCurrentUser()
  const roles = currentUser?.roles ?? []
  const canManageStores = roles.includes('SELLER') || roles.includes('ADMIN')
  const storesQuery = useMyStores({ enabled: canManageStores })
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Flex direction="column" minH="100vh">
      <Header showSearchBar={false} />
      <Box as="main" flex={1} px={{ base: 4, md: 8 }} py={8}>
        {profileQuery.isLoading ? (
          <Center minH="50vh">
            <Spinner />
          </Center>
        ) : profileQuery.isError ? (
          <Center minH="50vh">
            <Stack spacing={3} align="center">
              <Heading size="md">Unable to load profile</Heading>
              <Text color="red.500">{profileQuery.error?.message ?? 'Something went wrong'}</Text>
              <Button onClick={() => profileQuery.refetch()}>Retry</Button>
            </Stack>
          </Center>
        ) : profile ? (
          <Stack spacing={8}>
            <ProfileDetailsCard profile={profile} avatarUrl={avatarQuery.data?.url ?? null} />
            {canManageStores ? (
              <StoresSection
                stores={storesQuery.data}
                isLoading={storesQuery.isLoading}
                isError={storesQuery.isError}
                error={storesQuery.error}
                onCreateStore={onOpen}
              />
            ) : (
              <Card>
                <CardHeader fontWeight="semibold">Become a Seller</CardHeader>
                <CardBody>
                  <Stack spacing={3}>
                    <Text color="gray.600">
                      Create your first store to start listing products and selling on Tokopaedi.
                    </Text>
                    <Button colorScheme="teal" onClick={onOpen} alignSelf="flex-start">
                      Create Store
                    </Button>
                  </Stack>
                </CardBody>
              </Card>
            )}
          </Stack>
        ) : null}
      </Box>
      <Footer />
      <CreateStoreModal isOpen={isOpen} onClose={onClose} />
    </Flex>
  )
}
