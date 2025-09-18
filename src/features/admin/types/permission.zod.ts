import { z } from 'zod'

const NAME_ALLOWED_REGEX = /^[a-z0-9:-]+$/
const NAME_PART_ALLOWED_REGEX = /^[a-z0-9-]+$/

export const singleActionOptions = ['read', 'write', 'update', 'delete', 'create'] as const
export const bulkActionOptions = ['read', 'create', 'update', 'delete'] as const

const lowercaseTrim = (value: string) => value.trim().toLowerCase()

export const permissionNamePartSchema = z
  .string()
  .min(1, 'Wajib diisi')
  .transform(lowercaseTrim)
  .refine((value) => NAME_PART_ALLOWED_REGEX.test(value), 'huruf kecil/angka/- saja')

export const permissionActionSchema = z.enum(singleActionOptions, {
  message: 'pilih salah satu: read/write/update/delete',
})

export const permissionBulkActionSchema = z.enum(bulkActionOptions)

const descriptionTransformer = z
  .string()
  .transform((value) => value.trim())
  .refine((value) => value.length <= 240, {
    message: 'Maksimal 240 karakter',
  })

export const permissionFormSchema = z.object({
  service: permissionNamePartSchema,
  subject: permissionNamePartSchema,
  action: permissionActionSchema,
  description: descriptionTransformer.optional(),
  bulkActions: z.array(permissionBulkActionSchema).default([]),
})

export const permissionRequestSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .transform(lowercaseTrim)
    .refine((value) => NAME_ALLOWED_REGEX.test(value), 'huruf kecil/angka/- saja'),
  description: descriptionTransformer.optional(),
})

export type PermissionFormSchema = z.input<typeof permissionFormSchema>
export type PermissionRequestSchema = z.infer<typeof permissionRequestSchema>
