import { useEffect } from 'react'
import { authApi } from '@/features/auth/api'
import { useAuthStore } from '@/store/authStore'

export function AuthBootstrapper() {
  const tokens = useAuthStore((state) => state.tokens)
  const user = useAuthStore((state) => state.user)
  const initialized = useAuthStore((state) => state.initialized)
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)
  const markInitialized = useAuthStore((state) => state.markInitialized)

  useEffect(() => {
    if (!tokens) {
      markInitialized()
      return
    }

    if (initialized && user) {
      return
    }

    let cancelled = false

    async function bootstrap() {
      try {
        const profile = await authApi.me()
        if (!cancelled) {
          setUser(profile)
        }
      } catch {
        if (!cancelled) {
          logout()
        }
      } finally {
        if (!cancelled) {
          markInitialized()
        }
      }
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [tokens, initialized, user, setUser, logout, markInitialized])

  return null
}
