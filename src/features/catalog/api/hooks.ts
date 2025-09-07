import { useQuery, keepPreviousData } from '@tanstack/react-query'

import {
  listProductsService,
  type ProductListParams,
  type ProductPageDto,
} from '../services/catalog.service'

export function useListProducts(params: ProductListParams) {
  return useQuery<ProductPageDto, { code?: string; message: string }, ProductPageDto>({
    queryKey: ['products', params],
    queryFn: () => listProductsService(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })
}
