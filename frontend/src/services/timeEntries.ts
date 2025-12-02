import { apiClient } from './api-client'
import type { TimeEntry, TimeEntryPayload } from '@/types'

export interface TimeEntryFilters {
  project_ids?: number[]
  date_from?: string
  date_to?: string
}

export const timeEntriesApi = {
  list: async (filters: TimeEntryFilters = {}): Promise<TimeEntry[]> => {
    const params = new URLSearchParams()
    if (filters.project_ids) {
      filters.project_ids.forEach((id) => params.append('project_ids', String(id)))
    }
    if (filters.date_from) params.set('date_from', filters.date_from)
    if (filters.date_to) params.set('date_to', filters.date_to)
    const query = params.toString()
    const url = query ? `/time-entries?${query}` : '/time-entries'
    const { data } = await apiClient.get<TimeEntry[]>(url)
    return data
  },
  create: async (payload: TimeEntryPayload): Promise<TimeEntry> => {
    const { data } = await apiClient.post<TimeEntry>('/time-entries', payload)
    return data
  },
  update: async (
    entryId: number,
    payload: Partial<TimeEntryPayload>,
  ): Promise<TimeEntry> => {
    const { data } = await apiClient.patch<TimeEntry>(
      `/time-entries/${entryId}`,
      payload,
    )
    return data
  },
  remove: async (entryId: number): Promise<void> => {
    await apiClient.delete(`/time-entries/${entryId}`)
  },
}
