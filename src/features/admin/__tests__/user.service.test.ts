import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/test/setup'

import { assignRoleToUser, getUserRoles } from '../services/user.service'

describe('user service', () => {
  it('fetches user roles', async () => {
    server.use(
      http.get('http://localhost:8080/iam/api/v1/users/u1/roles', () =>
        HttpResponse.json(['USER']),
      ),
    )
    const roles = await getUserRoles('u1')
    expect(roles).toEqual(['USER'])
  })

  it('assigns role to user', async () => {
    let called = false
    server.use(
      http.post('http://localhost:8080/iam/api/v1/assign/user/u1/role/1', () => {
        called = true
        return HttpResponse.json({})
      }),
    )
    await assignRoleToUser('u1', 1)
    expect(called).toBe(true)
  })
})
