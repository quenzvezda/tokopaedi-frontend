import { z } from 'zod'

const ROLE_NAME_REGEX = /^[A-Z]+(?:_[A-Z]+)*$/

type NormalizeRoleNameOptions = {
  trimEdges?: boolean
}

export const roleNameSchema = z
  .string()
  .min(1, 'Role name is required')
  .regex(
    ROLE_NAME_REGEX,
    'Use uppercase letters and single underscores between words'
  )

export const normalizeRoleName = (
  raw: string,
  options: NormalizeRoleNameOptions = {}
): string => {
  const { trimEdges = false } = options
  const uppercase = raw.toUpperCase()
  const withUnderscores = uppercase.replace(/\s+/g, '_')
  const lettersAndUnderscores = withUnderscores.replace(/[^A-Z_]/g, '')
  const collapsedUnderscores = lettersAndUnderscores.replace(/_+/g, '_')
  const noLeadingUnderscores = collapsedUnderscores.replace(/^_+/, '')
  if (trimEdges) {
    return noLeadingUnderscores.replace(/_+$/g, '')
  }
  return noLeadingUnderscores
}
