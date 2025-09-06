import { z } from 'zod'

import http, { toApiError, type ApiError } from '@/shared/lib/fetcher'

export const ProductSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  description: z.string().optional(),
  price: z.union([z.number(), z.string()]).transform((v) => {
    if (typeof v === 'number') return v
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }).optional(),
  brandName: z.string().optional(),
  categoryName: z.string().optional(),
})

export type ProductDto = z.infer<typeof ProductSchema>

// Spring-like page response
const SpringPageSchema = z.object({
  content: z.array(ProductSchema),
  number: z.number().optional(),
  size: z.number().optional(),
  totalElements: z.number().optional(),
  totalPages: z.number().optional(),
})

// Generic/alternative page response
const GenericPageSchema = z.object({
  items: z.array(ProductSchema),
  page: z.number().optional(),
  size: z.number().optional(),
  total: z.number().optional(),
  totalPages: z.number().optional(),
})

export type ProductListParams = {
  q?: string
  brandId?: string
  categoryId?: string
  page?: number
  size?: number
}

export type ProductListResult = {
  items: ProductDto[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

function normalizePage(data: unknown): ProductListResult {
  // Try Spring Page shape
  const s = SpringPageSchema.safeParse(data)
  if (s.success) {
    return {
      items: s.data.content,
      page: s.data.number ?? 0,
      size: s.data.size ?? s.data.content.length,
      totalElements: s.data.totalElements ?? s.data.content.length,
      totalPages: s.data.totalPages ?? 1,
    }
  }
  // Try generic shape
  const g = GenericPageSchema.safeParse(data)
  if (g.success) {
    return {
      items: g.data.items,
      page: g.data.page ?? 0,
      size: g.data.size ?? g.data.items.length,
      totalElements: g.data.total ?? g.data.items.length,
      totalPages: g.data.totalPages ?? 1,
    }
  }
  // Array fallback
  const arr = z.array(ProductSchema).safeParse(data)
  if (arr.success) {
    return { items: arr.data, page: 0, size: arr.data.length, totalElements: arr.data.length, totalPages: 1 }
  }
  throw new Error('Invalid product list response')
}

export async function listProductsService(params: ProductListParams): Promise<ProductListResult> {
  try {
    const res = await http.get('/catalog/api/v1/products', { params })
    return normalizePage(res.data)
  } catch (err) {
    const e = toApiError(err)
    throw e as ApiError
  }
}

