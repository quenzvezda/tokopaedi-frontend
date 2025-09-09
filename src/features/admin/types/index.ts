export interface Permission {
  id: number
  name: string
  description?: string
}

export interface PermissionRequest {
  name: string
  description?: string
}

export interface Role {
  id: number
  name: string
}

export type RoleRequest = Pick<Role, 'name'>
