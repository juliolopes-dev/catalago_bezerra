import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { RotaProtegida } from '@/components/layout/RotaProtegida'
import { Login } from '@/pages/Login'
import { Catalogo } from '@/pages/Catalogo'
import { Carrinho } from '@/pages/Carrinho'
import { AdminUsuarios } from '@/pages/admin/Usuarios'
import { useVersionCheck } from '@/hooks/useVersionCheck'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
})

function AppContent() {
  useVersionCheck()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <RotaProtegida>
            <Layout />
          </RotaProtegida>
        }
      >
        <Route index element={<Catalogo />} />
        <Route path="carrinho" element={<Carrinho />} />
        <Route
          path="admin/usuarios"
          element={
            <RotaProtegida perfisPermitidos={['admin']}>
              <AdminUsuarios />
            </RotaProtegida>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
