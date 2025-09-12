import { describe, it, expect } from 'vitest'

import { listRoles } from '../services/role.service'

describe('listRoles v2 — search & sort', () => {
  it('filters by q (name contains, case-insensitive, minLen 2)', async () => {
    const res = await listRoles({ page: 0, size: 20, q: 'US' })
    expect(res.totalElements).toBe(1)
    expect(res.content[0]?.name).toBe('USER')
  })

  it('sorts by name desc', async () => {
    const res = await listRoles({ page: 0, size: 20, sort: ['name,desc'] })
    expect(res.content[0]?.name).toBe('USER')
  })
})

