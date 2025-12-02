import { Center, Spinner } from '@chakra-ui/react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function RequireAuth() {
  const tokens = useAuthStore((state) => state.tokens)
  const initialized = useAuthStore((state) => state.initialized)
  const location = useLocation()

  if (!initialized) {
    return (
      <Center minH="100vh">
        <Spinner size="lg" />
      </Center>
    )
  }

  if (!tokens) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}
