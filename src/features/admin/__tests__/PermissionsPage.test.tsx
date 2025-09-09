import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { BrowserRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { server } from '@/test/setup'

import PermissionsPage from '../pages/PermissionsPage'

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

const renderPermissionsPage = () => render(<PermissionsPage />, { wrapper: AllTheProviders })

describe('Permissions Page', () => {
  beforeEach(() => {
    queryClient.clear()
    server.resetHandlers()
    server.use(
      http.get('http://localhost:8080/iam/api/v1/permissions', () =>
        HttpResponse.json([
          { id: 1, name: 'iam:permission:create', description: 'Create IAM permissions' },
          { id: 2, name: 'iam:permission:read', description: 'Read IAM permissions' },
        ]),
      ),
    )
  })

  afterEach(() => {
    server.resetHandlers()
  })

  it('renders the permission table successfully', async () => {
    renderPermissionsPage()
    expect(await screen.findByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'iam:permission:create' })).toBeInTheDocument()
  })

  it('displays an error message if fetching permissions fails', async () => {
    server.use(
      http.get('http://localhost:8080/iam/api/v1/permissions', () =>
        HttpResponse.json({ message: 'Failed to fetch' }, { status: 500 }),
      ),
    )
    renderPermissionsPage()
    expect(await screen.findByText(/Error: Failed to fetch/i)).toBeInTheDocument()
  })

  it('opens create modal and shows validation error', async () => {
    const user = userEvent.setup()
    renderPermissionsPage()

    const createButton = await screen.findByRole('button', { name: /Create Permission/i })
    await user.click(createButton)

    const dialog = await screen.findByRole('dialog', { name: /Create Permission/i })
    expect(dialog).toBeInTheDocument()

    const submitButton = within(dialog).getByRole('button', { name: /Save/i })
    await user.click(submitButton)

    expect(await within(dialog).findByText(/Name is required/i)).toBeInTheDocument()
  })
})
