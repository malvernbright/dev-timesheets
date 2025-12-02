import { apiClient } from './api-client'
import type { IntegrationPayload, IntegrationToken } from '@/types'

export const integrationsApi = {
  list: async (): Promise<IntegrationToken[]> => {
    const { data } = await apiClient.get<IntegrationToken[]>('/integrations')
    return data
  },
  upsert: async (payload: IntegrationPayload): Promise<IntegrationToken> => {
    const { data } = await apiClient.post<IntegrationToken>(
      '/integrations',
      payload,
    )
    return data
  },
}
