import { z } from 'zod'

const UserProfileResponse = z
  .object({
    userId: z.string().uuid(),
    fullName: z.string(),
    bio: z.string().nullish(),
    phone: z.string().nullish(),
    avatarObjectKey: z.string().nullish(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .passthrough()
const ApiError = z
  .object({
    code: z.string().nullish(),
    message: z.string(),
    requestId: z.string().nullish(),
    meta: z.object({}).partial().passthrough().optional(),
  })
  .passthrough()
const UserProfileUpdateRequest = z
  .object({
    fullName: z.string().min(1),
    bio: z.string().max(500).nullish(),
    phone: z.string().max(32).nullish(),
    avatarObjectKey: z
      .string()
      .describe('Object key returned by avatar upload URL endpoint.')
      .nullish(),
  })
  .passthrough()
const AvatarUploadRequest = z
  .object({
    fileName: z.string().describe('Original file name, used to preserve extension.').nullable(),
    contentType: z.string().describe('MIME type for the upload (e.g., image/png).').nullable(),
  })
  .partial()
  .passthrough()
const PresignedUrlResponse = z
  .object({
    url: z.string(),
    method: z.enum(['GET', 'PUT']),
    expiresAt: z.string().datetime({ offset: true }),
    headers: z
      .record(z.string(), z.string())
      .describe('Headers that must be included in the upload/view request.')
      .optional(),
    objectKey: z.string().nullish(),
  })
  .passthrough()
const StoreProfileResponse = z
  .object({
    id: z.string().uuid(),
    ownerId: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullish(),
    active: z.boolean(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .passthrough()
const StoreCreateRequest = z
  .object({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().max(500).nullish(),
  })
  .passthrough()
const StoreUpdateRequest = z
  .object({
    name: z.string().min(1).nullable(),
    slug: z.string().min(1).nullable(),
    description: z.string().max(500).nullable(),
    active: z.boolean().nullable(),
  })
  .partial()
  .passthrough()

export const schemas = {
  UserProfileResponse,
  ApiError,
  UserProfileUpdateRequest,
  AvatarUploadRequest,
  PresignedUrlResponse,
  StoreProfileResponse,
  StoreCreateRequest,
  StoreUpdateRequest,
}

