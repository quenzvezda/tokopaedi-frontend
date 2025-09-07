import { z } from 'zod'

type ProductPage = {
  content: Array<Product>
  number?: /**
   * Zero-based page index
   */
  number | undefined
  size?: number | undefined
  totalElements?: number | undefined
  totalPages?: number | undefined
}
type Product = {
  /**
   * Product identifier (stringified)
   */
  id: string
  name: string
  description?: (string | null) | undefined
  price?:
    | /**
     * Optional in v1; may become required in a future version
     */
    (number | null)
    | undefined
  brandName?: (string | null) | undefined
  categoryName?: (string | null) | undefined
}

const Brand = z
  .object({ id: z.string().uuid().nullish(), name: z.string(), active: z.boolean() })
  .passthrough()
const BrandCreateRequest = z
  .object({ name: z.string(), active: z.boolean().nullish() })
  .passthrough()
const BrandUpdateRequest = z
  .object({ name: z.string(), active: z.boolean().nullish() })
  .passthrough()
const Category = z
  .object({
    id: z.string().uuid().nullish(),
    parentId: z.string().uuid().nullish(),
    name: z.string(),
    active: z.boolean(),
    sortOrder: z.number().int().nullish(),
  })
  .passthrough()
const CategoryCreateRequest = z
  .object({
    name: z.string(),
    parentId: z.string().uuid().nullish(),
    active: z.boolean().nullish(),
    sortOrder: z.number().int().nullish(),
  })
  .passthrough()
const CategoryUpdateRequest = z
  .object({
    name: z.string(),
    parentId: z.string().uuid().nullish(),
    active: z.boolean().nullish(),
    sortOrder: z.number().int().nullish(),
  })
  .passthrough()
const Product: z.ZodType<Product> = z
  .object({
    id: z.string().describe('Product identifier (stringified)'),
    name: z.string(),
    description: z.string().nullish(),
    price: z.number().describe('Optional in v1; may become required in a future version').nullish(),
    brandName: z.string().nullish(),
    categoryName: z.string().nullish(),
  })
  .passthrough()
const ProductPage: z.ZodType<ProductPage> = z
  .object({
    content: z.array(Product),
    number: z.number().int().describe('Zero-based page index').optional(),
    size: z.number().int().optional(),
    totalElements: z.number().int().optional(),
    totalPages: z.number().int().optional(),
  })
  .passthrough()
const ApiError = z.object({ code: z.string().nullish(), message: z.string() }).passthrough()
const ProductCreateRequest = z
  .object({
    name: z.string(),
    shortDesc: z.string().nullish(),
    brandId: z.string().uuid(),
    categoryId: z.string().uuid(),
    published: z.boolean().nullish(),
  })
  .passthrough()
const ProductDetail = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    shortDesc: z.string().nullish(),
    brandId: z.string().uuid(),
    categoryId: z.string().uuid(),
    published: z.boolean(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }).nullish(),
  })
  .passthrough()
const ProductUpdateRequest = z
  .object({
    name: z.string().nullable(),
    shortDesc: z.string().nullable(),
    brandId: z.string().uuid().nullable(),
    categoryId: z.string().uuid().nullable(),
    published: z.boolean().nullable(),
  })
  .partial()
  .passthrough()
const SkuCreateRequest = z
  .object({
    productId: z.string().uuid(),
    skuCode: z.string(),
    active: z.boolean().nullish(),
    barcode: z.string().nullish(),
  })
  .passthrough()
const Sku = z
  .object({
    id: z.string().uuid(),
    productId: z.string().uuid(),
    skuCode: z.string(),
    active: z.boolean(),
    barcode: z.string().nullish(),
  })
  .passthrough()
const SkuUpdateRequest = z
  .object({
    skuCode: z.string().nullable(),
    active: z.boolean().nullable(),
    barcode: z.string().nullable(),
  })
  .partial()
  .passthrough()

export const schemas = {
  Brand,
  BrandCreateRequest,
  BrandUpdateRequest,
  Category,
  CategoryCreateRequest,
  CategoryUpdateRequest,
  Product,
  ProductPage,
  ApiError,
  ProductCreateRequest,
  ProductDetail,
  ProductUpdateRequest,
  SkuCreateRequest,
  Sku,
  SkuUpdateRequest,
}
