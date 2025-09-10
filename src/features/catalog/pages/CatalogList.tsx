import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Image,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useSearchParams } from 'react-router-dom'

import { Footer, Header } from '@/shared/ui/PageLayout'

import { useListProducts } from '../api/hooks'

function ProductCard({ name, price }: { name: string; price?: number | null }) {
  return (
    <Card _hover={{ boxShadow: 'md' }} transition="box-shadow 0.2s">
      <Image src="/vite.svg" alt={name} objectFit="contain" h="120px" mt={4} />
      <CardHeader>
        <Heading size="sm" noOfLines={2}>
          {name}
        </Heading>
      </CardHeader>
      <CardBody pt={0}>
        <Text fontWeight="bold">
          {typeof price === 'number' ? `Rp ${price.toLocaleString('id-ID')}` : '—'}
        </Text>
      </CardBody>
    </Card>
  )
}

export default function CatalogList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? undefined
  const brandId = searchParams.get('brandId') ?? undefined
  const categoryId = searchParams.get('categoryId') ?? undefined
  const page = Number(searchParams.get('page') ?? '0')
  const size = Number(searchParams.get('size') ?? '12')

  const { data, isLoading, isError, error, isFetching } = useListProducts({
    q,
    brandId,
    categoryId,
    page,
    size,
  })

  function goPage(p: number) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(p))
    setSearchParams(next)
  }

  return (
    <Flex direction="column">
      <Header />
      <Box as="main" flex={1} minH="calc(100vh + 1px)" px={6} py={6}>
        <Stack spacing={4}>
          <HStack justify="space-between">
            <Heading size="lg">Products</Heading>
            {isFetching && (
              <Text fontSize="sm" color="gray.500">
                Refreshing…
              </Text>
            )}
          </HStack>

          {isLoading ? (
            <Grid templateColumns="repeat(4, 1fr)" gap={4}>
              {Array.from({ length: 8 }).map((_, i) => (
                <GridItem key={i}>
                  <Card>
                    <Skeleton height="160px" />
                    <CardBody>
                      <Skeleton height="16px" mb={2} />
                      <Skeleton height="14px" width="50%" />
                    </CardBody>
                  </Card>
                </GridItem>
              ))}
            </Grid>
          ) : isError ? (
            <Center py={20}>
              <Stack spacing={2} align="center">
                <Heading size="md">Error</Heading>
                <Text color="red.500">{error?.message || 'Failed to load products'}</Text>
                <Button onClick={() => goPage(page)}>Retry</Button>
              </Stack>
            </Center>
          ) : data && data.content.length === 0 ? (
            <Center py={20}>
              <Stack spacing={2} align="center">
                <Heading size="md">No products</Heading>
                <Text color="gray.500">Try adjusting your filters</Text>
              </Stack>
            </Center>
          ) : (
            <>
              <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4}>
                {data?.content.map((p) => (
                  <GridItem key={p.id}>
                    <ProductCard name={p.name} price={p.price} />
                  </GridItem>
                ))}
              </Grid>
              <HStack justify="center" mt={4} spacing={4}>
                <Button onClick={() => goPage(Math.max(0, page - 1))} isDisabled={page <= 0}>
                  Previous
                </Button>
                <Text>
                  Page {page + 1} of {data?.totalPages ?? 1}
                </Text>
                <Button
                  onClick={() => goPage(Math.min((data?.totalPages ?? 1) - 1, page + 1))}
                  isDisabled={page + 1 >= (data?.totalPages ?? 1)}
                >
                  Next
                </Button>
              </HStack>
            </>
          )}
        </Stack>
      </Box>
      <Footer />
    </Flex>
  )
}
