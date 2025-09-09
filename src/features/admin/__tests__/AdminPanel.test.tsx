import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { BrowserRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { server } from '@/test/setup'

import AdminPage from '../pages/Admin'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
})

vi.mock('@/features/auth/useAuth', () => {
  const mockAuth = () => ({
    isAuthenticated: true,
    accessToken: 'fake-admin-token',
  })
  return { useAuth: mockAuth, default: mockAuth }
})

vi.mock('@/features/auth/api/hooks', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/features/auth/api/hooks')>()
  return {
    ...original,
    useCurrentUser: () => ({
      data: {
        id: 'mock-admin-id',
        username: 'mock-admin',
        roles: ['ADMIN'],
      },
      isLoading: false,
      isError: false,
    }),
  }
})

const AllTheProviders = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </BrowserRouter>
)

const renderAdminPage = () => render(<AdminPage />, { wrapper: AllTheProviders })

describe('Admin Panel', () => {
  beforeEach(() => {
    queryClient.clear()
    server.resetHandlers()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  it('renders the role table successfully', async () => {
    renderAdminPage()
    expect(await screen.findByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'ADMIN' })).toBeInTheDocument()
  })

  it('displays an error message if fetching roles fails', async () => {
    server.use(
      http.get('http://localhost:8080/iam/api/v1/roles', () =>
        HttpResponse.json({ message: 'Failed to fetch' }, { status: 500 }),
      ),
    )
    renderAdminPage()
    expect(await screen.findByText(/Failed to fetch/i)).toBeInTheDocument()
  })

  it('opens create modal and shows validation error', async () => {
    const user = userEvent.setup()
    renderAdminPage()

    const createButton = await screen.findByRole('button', { name: /Create Role/i })
    await user.click(createButton)

    const dialog = await screen.findByRole('dialog', { name: /Create New Role/i })
    expect(dialog).toBeInTheDocument()

    const submitButton = within(dialog).getByRole('button', { name: /Create/i })
    await user.click(submitButton)

    expect(await within(dialog).findByText(/Role name is required/i)).toBeInTheDocument()
  })
})
