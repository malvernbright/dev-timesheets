import { apiClient } from './api-client'
import type { Project, ProjectPayload } from '@/types'

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    const { data } = await apiClient.get<Project[]>('/projects')
    return data
  },
  create: async (payload: ProjectPayload): Promise<Project> => {
    const { data } = await apiClient.post<Project>('/projects', payload)
    return data
  },
}
