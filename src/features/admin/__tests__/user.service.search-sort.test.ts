import { describe, expect, it } from 'vitest'

import { listUsers } from '../services/user.service'

describe('listUsers - search & sort', () => {
  it('filters by username substring (minLen 2)', async () => {
    const res = await listUsers({ page: 0, size: 10, q: 'al' })
    expect(res.totalElements).toBe(1)
    expect(res.content[0]?.username).toBe('alice')
  })

  it('sorts by id desc', async () => {
    const res = await listUsers({ page: 0, size: 10, sort: ['id,desc'] })
    expect(res.content[0]?.id).toBe('44444444-4444-4444-8444-444444444444')
  })

  it('supports pagination window', async () => {
    const res = await listUsers({ page: 1, size: 2 })
    expect(res.content).toHaveLength(2)
    expect(res.number).toBe(1)
    expect(res.totalPages).toBeGreaterThanOrEqual(2)
  })
})
