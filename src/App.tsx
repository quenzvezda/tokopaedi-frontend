import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './features/auth/pages/Login'
import Welcome from './features/misc/pages/Welcome'
import RequireAuth from './features/auth/components/RequireAuth'
import { AuthProvider } from './features/auth/AuthContext'
import Forbidden from './features/misc/pages/Forbidden'
import NotFound from './features/misc/pages/NotFound'
import { RequireRoles } from './features/auth/rbac'
import Admin from './features/admin/pages/Admin'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Welcome />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <RequireRoles roles="ADMIN">
                  <Admin />
                </RequireRoles>
              </RequireAuth>
            }
          />
          <Route path="/403" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
