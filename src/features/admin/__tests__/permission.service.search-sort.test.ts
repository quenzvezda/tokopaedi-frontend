import { describe, it, expect } from 'vitest'

import { listPermissions } from '../services/permission.service'

describe('listPermissions v2 — search & sort', () => {
  it('filters by q across name & description (minLen 2)', async () => {
    const byName = await listPermissions({ page: 0, size: 50, q: 'user' })
    expect(byName.totalElements).toBe(2)
    expect(byName.content.map((p) => p.name)).toEqual(['user.read', 'user.write'])

    const byDesc = await listPermissions({ page: 0, size: 50, q: 'order data' })
    expect(byDesc.totalElements).toBe(2)
    expect(byDesc.content.map((p) => p.name)).toEqual(['order.read', 'order.write'])
  })

  it('sorts by id desc', async () => {
    const res = await listPermissions({ page: 0, size: 50, q: 'user', sort: ['id,desc'] })
    expect(res.content[0]?.id).toBe(11)
  })
})

