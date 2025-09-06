import { useQuery, keepPreviousData } from '@tanstack/react-query'

import { listProductsService, type ProductListParams, type ProductListResult } from '../services/catalog.service'

export function useListProducts(params: ProductListParams) {
  return useQuery<ProductListResult, { code?: string; message: string }, ProductListResult>({
    queryKey: ['products', params],
    queryFn: () => listProductsService(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })
}
