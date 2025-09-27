import { AxiosError } from 'axios'
import { z } from 'zod'

import { schemas as ProfileSchemas } from '@/generated/openapi/profile/schemas'
import type { components } from '@/generated/openapi/profile/types'
import http, { toApiError, type ApiError } from '@/shared/lib/fetcher'

export type UserProfileDto = components['schemas']['UserProfileResponse']
export type UserProfileUpdateDto = components['schemas']['UserProfileUpdateRequest']
export type AvatarUploadRequestDto = components['schemas']['AvatarUploadRequest']
export type PresignedUrlDto = components['schemas']['PresignedUrlResponse']
export type StoreProfileDto = components['schemas']['StoreProfileResponse']
export type StoreCreateDto = components['schemas']['StoreCreateRequest']
export type StoreUpdateDto = components['schemas']['StoreUpdateRequest']

const UserProfileSchema = ProfileSchemas.UserProfileResponse
const PresignedUrlSchema = ProfileSchemas.PresignedUrlResponse
const StoreProfileSchema = ProfileSchemas.StoreProfileResponse
const StoreListSchema = z.array(StoreProfileSchema)

const PROFILE_BASE_PATH = '/profile/api/v1/profiles'

function parseUserProfile(data: unknown): UserProfileDto {
  const parsed = UserProfileSchema.safeParse(data)
  if (!parsed.success) throw new Error('Invalid profile response')
  return parsed.data
}

function parsePresignedUrl(data: unknown): PresignedUrlDto {
  const parsed = PresignedUrlSchema.safeParse(data)
  if (!parsed.success) throw new Error('Invalid presigned URL response')
  return parsed.data
}

function parseStoreProfile(data: unknown): StoreProfileDto {
  const parsed = StoreProfileSchema.safeParse(data)
  if (!parsed.success) throw new Error('Invalid store profile response')
  return parsed.data
}

function parseStoreList(data: unknown): StoreProfileDto[] {
  const parsed = StoreListSchema.safeParse(data)
  if (!parsed.success) throw new Error('Invalid store list response')
  return parsed.data
}

export async function getMyProfileService(): Promise<UserProfileDto> {
  try {
    const res = await http.get(`${PROFILE_BASE_PATH}/me`)
    return parseUserProfile(res.data)
  } catch (err) {
    throw toApiError(err) as ApiError
  }
}

export async function updateMyProfileService(input: UserProfileUpdateDto): Promise<UserProfileDto> {
  try {
    const res = await http.put(`${PROFILE_BASE_PATH}/me`, input)
    return parseUserProfile(res.data)
  } catch (err) {
    throw toApiError(err) as ApiError
  }
}

export async function requestAvatarUploadUrlService(
  input?: AvatarUploadRequestDto,
): Promise<PresignedUrlDto> {
  try {
    const res = await http.post(`${PROFILE_BASE_PATH}/me/avatar-upload-url`, input ?? {})
    return parsePresignedUrl(res.data)
  } catch (err) {
    throw toApiError(err) as ApiError
  }
}

export async function getAvatarViewUrlService(): Promise<PresignedUrlDto | null> {
  try {
    const res = await http.get(`${PROFILE_BASE_PATH}/me/avatar-view-url`)
    return parsePresignedUrl(res.data)
  } catch (err) {
    const axiosErr = err as AxiosError
    if (axiosErr.response?.status === 404) return null
    throw toApiError(err) as ApiError
  }
}

export async function listMyStoresService(): Promise<StoreProfileDto[]> {
  try {
    const res = await http.get(`${PROFILE_BASE_PATH}/me/stores`)
    return parseStoreList(res.data)
  } catch (err) {
    throw toApiError(err) as ApiError
  }
}

export async function createStoreService(input: StoreCreateDto): Promise<StoreProfileDto> {
  try {
    const res = await http.post(`${PROFILE_BASE_PATH}/me/stores`, input)
    return parseStoreProfile(res.data)
  } catch (err) {
    throw toApiError(err) as ApiError
  }
}

export async function updateStoreService(
  storeId: string,
  input: StoreUpdateDto,
): Promise<StoreProfileDto> {
  try {
    const res = await http.patch(`${PROFILE_BASE_PATH}/me/stores/${storeId}`, input)
    return parseStoreProfile(res.data)
  } catch (err) {
    throw toApiError(err) as ApiError
  }
}
