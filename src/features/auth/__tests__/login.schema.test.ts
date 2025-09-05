import { describe, it, expect } from 'vitest'

import { LoginRequestSchema } from '../services/auth.service'

describe('LoginRequestSchema', () => {
  it('fails when usernameOrEmail and password are empty', () => {
    const result = LoginRequestSchema.safeParse({ usernameOrEmail: '', password: '' })
    expect(result.success).toBe(false)
  })
})

