import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import type { Perfil } from '@/types/usuario.types'

interface RotaProtegidaProps {
  children: React.ReactNode
  perfisPermitidos?: Perfil[]
}

export function RotaProtegida({ children, perfisPermitidos }: RotaProtegidaProps) {
  const { usuario, token } = useAuthStore()

  if (!token || !usuario) {
    return <Navigate to="/login" replace />
  }

  if (perfisPermitidos && !perfisPermitidos.includes(usuario.perfil)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
