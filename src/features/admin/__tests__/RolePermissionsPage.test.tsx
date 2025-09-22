import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { server } from '@/test/setup'

import RolePermissionsPage from '../pages/RolePermissionsPage'
import { ROLE_PERMISSION_ENDPOINT_FALLBACK_MESSAGE } from '../services/role-permission.service'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
})

const renderRolePermissionsPage = () =>
  render(
    <MemoryRouter initialEntries={['/admin/roles/1/permissions']}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/admin/roles/:id/permissions" element={<RolePermissionsPage />} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>,
  )

describe('RolePermissionsPage', () => {
  beforeEach(() => {
    queryClient.clear()
    server.resetHandlers()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  it('renders assigned permissions from the consolidated endpoint', async () => {
    renderRolePermissionsPage()

    expect(await screen.findByText('user.read')).toBeInTheDocument()
    expect(await screen.findByText('user.write')).toBeInTheDocument()
  })

  it('fetches available permissions when assigning via the consolidated endpoint', async () => {
    const user = userEvent.setup()
    renderRolePermissionsPage()

    await screen.findByText('user.read')
    await user.click(screen.getByRole('button', { name: /assign permission/i }))

    const modal = await screen.findByRole('dialog', { name: /assign permissions/i })
    expect(await within(modal).findByRole('checkbox', { name: 'order.read' })).toBeInTheDocument()
    expect(await within(modal).findByRole('checkbox', { name: 'order.write' })).toBeInTheDocument()
  })

  it('shows a friendly message when the consolidated endpoint is not yet available', async () => {
    server.use(
      http.get('http://localhost:8080/iam/api/v1/roles/:roleId/permissions', () =>
        HttpResponse.json({ message: 'Not Found' }, { status: 404 }),
      ),
    )

    renderRolePermissionsPage()

    expect(
      await screen.findByText(ROLE_PERMISSION_ENDPOINT_FALLBACK_MESSAGE),
    ).toBeInTheDocument()
  })
})

