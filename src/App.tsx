import { Spinner, Center } from '@chakra-ui/react'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import RouteBoundary from '@/app/routes/RouteBoundary'

import { AuthProvider } from './features/auth/AuthContext'
import RequireAuth from './features/auth/components/RequireAuth'
import { RequireRoles } from './features/auth/rbac'

const Login = lazy(() => import('./features/auth/pages/Login'))
const Register = lazy(() => import('./features/auth/pages/Register'))
const CatalogList = lazy(() => import('./features/catalog/pages/CatalogList'))
const Forbidden = lazy(() => import('./features/misc/pages/Forbidden'))
const NotFound = lazy(() => import('./features/misc/pages/NotFound'))
const Admin = lazy(() => import('./features/admin/pages/Admin'))

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense
          fallback={
            <Center minH="60vh">
              <Spinner />
            </Center>
          }
        >
          <Routes>
          <Route path="/login" element={<RouteBoundary><Login /></RouteBoundary>} />
          <Route path="/register" element={<RouteBoundary><Register /></RouteBoundary>} />
          <Route path="/" element={<RouteBoundary><CatalogList /></RouteBoundary>} />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <RequireRoles roles="ADMIN">
                  <RouteBoundary>
                    <Admin />
                  </RouteBoundary>
                </RequireRoles>
              </RequireAuth>
            }
          />
          <Route path="/403" element={<RouteBoundary><Forbidden /></RouteBoundary>} />
          <Route path="*" element={<RouteBoundary><NotFound /></RouteBoundary>} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
