import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'

import { AuthProvider } from '../../auth/AuthContext'
import Login from '../pages/Login'

vi.mock('../api/hooks', () => {
  const mutateAsync = vi.fn()
  return {
    useLogin: () => ({ isPending: false, mutateAsync }),
  }
})

function AppWrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient()
  return (
    <ChakraProvider>
      <AuthProvider>
        <QueryClientProvider client={client}>
          <MemoryRouter>{children}</MemoryRouter>
        </QueryClientProvider>
      </AuthProvider>
    </ChakraProvider>
  )
}

describe('LoginForm', () => {
  it('does not submit when required fields are empty', async () => {
    render(<Login />, { wrapper: AppWrapper })
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    // Expect the mocked mutateAsync not to be called due to validation errors
    const { useLogin } = await import('../api/hooks')
    const result = useLogin() as unknown as { mutateAsync: ReturnType<typeof vi.fn> }
    expect(result.mutateAsync).not.toHaveBeenCalled()
  })
})
