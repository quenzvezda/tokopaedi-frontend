import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createRole,
  deleteRole,
  listRoles,
  updateRole,
  type RoleRequest,
} from '../services/role.service'

const queryKey = ['roles']

export function useGetRoles() {
  return useQuery({
    queryKey,
    queryFn: listRoles,
  })
}

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RoleRequest) => createRole(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey })
    },
  })
}

export function useUpdateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoleRequest }) => updateRole(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey })
    },
  })
}

export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey })
    },
  })
}
