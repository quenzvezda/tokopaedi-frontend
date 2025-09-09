import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createPermission,
  deletePermission,
  listPermissions,
  updatePermission,
} from '../services/permission.service'
import { createRole, deleteRole, listRoles, updateRole } from '../services/role.service'

import type { PermissionRequest, RoleRequest } from '../types'
const rolesQueryKey = ['roles']
const permissionsQueryKey = ['permissions']

export function useGetRoles() {
  return useQuery({
    queryKey: rolesQueryKey,
    queryFn: listRoles,
  })
}

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RoleRequest) => createRole(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rolesQueryKey })
    },
  })
}

export function useUpdateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoleRequest }) => updateRole(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rolesQueryKey })
    },
  })
}

export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rolesQueryKey })
    },
  })
}

export function useGetPermissions() {
  return useQuery({
    queryKey: permissionsQueryKey,
    queryFn: listPermissions,
  })
}

export function useCreatePermission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: PermissionRequest) => createPermission(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: permissionsQueryKey })
    },
  })
}

export function useUpdatePermission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PermissionRequest }) =>
      updatePermission(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: permissionsQueryKey })
    },
  })
}

export function useDeletePermission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deletePermission(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: permissionsQueryKey })
    },
  })
}
