import { z } from 'zod'

export const profileFormSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(120, 'Full name is too long'),
  bio: z
    .string()
    .max(500, 'Bio must be at most 500 characters')
    .optional(),
  phone: z
    .string()
    .max(32, 'Phone number must be at most 32 characters')
    .optional(),
  avatarObjectKey: z.string().optional().nullable(),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const storeFormSchema = z.object({
  name: z.string().trim().min(1, 'Store name is required').max(120, 'Store name is too long'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(120, 'Slug is too long')
    .regex(slugRegex, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional(),
})

export type StoreFormValues = z.infer<typeof storeFormSchema>
