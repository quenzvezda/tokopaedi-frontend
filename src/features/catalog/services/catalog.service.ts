// zod imported via generated schemas; no direct import needed here
import { schemas as CatalogSchemas } from '@/generated/openapi/catalog/schemas'
import type { components } from '@/generated/openapi/catalog/types'
import http, { toApiError, type ApiError } from '@/shared/lib/fetcher'

// Use Zod schemas generated from OpenAPI for runtime validation
const ProductPageSchema = CatalogSchemas.ProductPage

// Use generated type as the source of truth for DTO shape
export type ProductDto = components['schemas']['Product']

// Note: Contract-first adopts a single (Spring-style) page response

export type ProductListParams = {
  q?: string
  brandId?: string
  categoryId?: string
  page?: number
  size?: number
}

export type ProductPageDto = components['schemas']['ProductPage']

function parseProductPage(data: unknown): ProductPageDto {
  const s = ProductPageSchema.safeParse(data)
  if (!s.success) throw new Error('Invalid product list response')
  return s.data
}

// Use path directly from OpenAPI contract - no need for separate base path
export async function listProductsService(params: ProductListParams): Promise<ProductPageDto> {
  try {
    const res = await http.get('/catalog/api/v1/products', { params })
    return parseProductPage(res.data)
  } catch (err) {
    const e = toApiError(err)
    throw e as ApiError
  }
}
