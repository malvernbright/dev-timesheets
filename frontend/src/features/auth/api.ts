import { apiClient } from '@/services/api-client'
import type { AuthTokens, LoginPayload, RegisterPayload, User } from '@/types'

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthTokens> => {
    const { data } = await apiClient.post<AuthTokens>('/auth/login', payload)
    return data
  },
  register: async (payload: RegisterPayload): Promise<AuthTokens> => {
    const { data } = await apiClient.post<AuthTokens>('/auth/register', payload)
    return data
  },
  me: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me')
    return data
  },
}
