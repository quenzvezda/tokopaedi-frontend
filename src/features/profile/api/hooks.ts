import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { ApiError } from '@/shared/lib/fetcher'

import {
  createStoreService,
  getAvatarViewUrlService,
  getMyProfileService,
  listMyStoresService,
  requestAvatarUploadUrlService,
  updateMyProfileService,
  updateStoreService,
  type AvatarUploadRequestDto,
  type PresignedUrlDto,
  type StoreCreateDto,
  type StoreProfileDto,
  type StoreUpdateDto,
  type UserProfileDto,
  type UserProfileUpdateDto,
} from '../services/profile.service'

const PROFILE_QUERY_KEY = ['profile', 'me'] as const
const AVATAR_QUERY_KEY = ['profile', 'avatar'] as const
const STORES_QUERY_KEY = ['profile', 'stores'] as const

export function useMyProfile() {
  return useQuery<UserProfileDto, ApiError>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => getMyProfileService(),
    staleTime: 60_000,
  })
}

export function useUpdateMyProfile() {
  const qc = useQueryClient()
  return useMutation<UserProfileDto, ApiError, UserProfileUpdateDto>({
    mutationFn: (input) => updateMyProfileService(input),
    onSuccess: (data) => {
      qc.setQueryData(PROFILE_QUERY_KEY, data)
      qc.invalidateQueries({ queryKey: AVATAR_QUERY_KEY })
    },
  })
}

export function useAvatarViewUrl(avatarKey?: string | null) {
  return useQuery<PresignedUrlDto | null, ApiError>({
    queryKey: [...AVATAR_QUERY_KEY, avatarKey ?? 'none'],
    enabled: !!avatarKey,
    queryFn: () => getAvatarViewUrlService(),
    staleTime: 30_000,
  })
}

export function useRequestAvatarUploadUrl() {
  return useMutation<PresignedUrlDto, ApiError, AvatarUploadRequestDto | undefined>({
    mutationFn: (input) => requestAvatarUploadUrlService(input),
  })
}

export function useMyStores(options?: { enabled?: boolean }) {
  return useQuery<StoreProfileDto[], ApiError>({
    queryKey: STORES_QUERY_KEY,
    enabled: options?.enabled ?? true,
    queryFn: () => listMyStoresService(),
    staleTime: 30_000,
  })
}

export function useCreateStore() {
  const qc = useQueryClient()
  return useMutation<StoreProfileDto, ApiError, StoreCreateDto>({
    mutationFn: (input) => createStoreService(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STORES_QUERY_KEY })
      qc.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
      qc.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

export function useUpdateStore() {
  const qc = useQueryClient()
  return useMutation<StoreProfileDto, ApiError, { storeId: string; input: StoreUpdateDto }>({
    mutationFn: ({ storeId, input }) => updateStoreService(storeId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STORES_QUERY_KEY })
    },
  })
}
