import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createPermission,
  deletePermission,
  listPermissions,
  updatePermission,
} from '../services/permission.service'
import {
  assignPermissionToRole,
  listAvailableRolePermissions,
  listRolePermissions,
  removePermissionFromRole,
} from '../services/role-permission.service'
import {
  createRole,
  deleteRole,
  getRole,
  listRoles,
  updateRole,
} from '../services/role.service'
import {
  assignRoleToUser,
  getUserRoles,
  listUsers,
  removeRoleFromUser,
} from '../services/user.service'

import type { PermissionRequest, RoleRequest } from '../types'
const rolesQueryKey = ['roles']
const permissionsQueryKey = ['permissions']
const rolePermissionsQueryKey = (roleId: number) => [...rolesQueryKey, roleId, 'permissions']
const availableRolePermissionsQueryKey = (roleId: number) => [
  ...rolesQueryKey,
  roleId,
  'permissions',
  'available',
]
const usersQueryKey = ['users']
const userRolesQueryKey = (accountId: string) => [...usersQueryKey, accountId, 'roles']

export function useGetRoles() {
  return useQuery({
    queryKey: rolesQueryKey,
    queryFn: listRoles,
  })
}

export function useGetRole(id: number) {
  return useQuery({
    queryKey: [...rolesQueryKey, id],
    queryFn: () => getRole(id),
    enabled: !!id,
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

export function useGetUsers() {
  return useQuery({
    queryKey: usersQueryKey,
    queryFn: listUsers,
  })
}

export function useGetUserRoles(accountId: string) {
  return useQuery({
    queryKey: userRolesQueryKey(accountId),
    queryFn: () => getUserRoles(accountId),
    enabled: !!accountId,
  })
}

export function useAssignRoleToUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ accountId, roleId }: { accountId: string; roleId: number }) =>
      assignRoleToUser(accountId, roleId),
    onSuccess: (_, { accountId }) => {
      qc.invalidateQueries({ queryKey: userRolesQueryKey(accountId) })
    },
  })
}

export function useRemoveRoleFromUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ accountId, roleId }: { accountId: string; roleId: number }) =>
      removeRoleFromUser(accountId, roleId),
    onSuccess: (_, { accountId }) => {
      qc.invalidateQueries({ queryKey: userRolesQueryKey(accountId) })
    },
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

export function useGetRolePermissions(roleId: number) {
  return useQuery({
    queryKey: rolePermissionsQueryKey(roleId),
    queryFn: () => listRolePermissions(roleId),
    enabled: !!roleId,
  })
}

export function useGetAvailableRolePermissions(roleId: number) {
  return useQuery({
    queryKey: availableRolePermissionsQueryKey(roleId),
    queryFn: () => listAvailableRolePermissions(roleId),
    enabled: !!roleId,
  })
}

export function useAssignPermissionToRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: number; permissionId: number }) =>
      assignPermissionToRole(roleId, permissionId),
    onSuccess: (_, { roleId }) => {
      qc.invalidateQueries({ queryKey: rolePermissionsQueryKey(roleId) })
      qc.invalidateQueries({ queryKey: availableRolePermissionsQueryKey(roleId) })
    },
  })
}

export function useRemovePermissionFromRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: number; permissionId: number }) =>
      removePermissionFromRole(roleId, permissionId),
    onSuccess: (_, { roleId }) => {
      qc.invalidateQueries({ queryKey: rolePermissionsQueryKey(roleId) })
      qc.invalidateQueries({ queryKey: availableRolePermissionsQueryKey(roleId) })
    },
  })
}
