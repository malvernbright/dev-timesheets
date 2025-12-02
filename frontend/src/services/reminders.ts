import { apiClient } from './api-client'
import type { Reminder, ReminderPayload } from '@/types'

export const remindersApi = {
  list: async (): Promise<Reminder[]> => {
    const { data } = await apiClient.get<Reminder[]>('/reminders')
    return data
  },
  create: async (payload: ReminderPayload): Promise<Reminder> => {
    const { data } = await apiClient.post<Reminder>('/reminders', payload)
    return data
  },
  update: async (
    reminderId: number,
    payload: Partial<ReminderPayload>,
  ): Promise<Reminder> => {
    const { data } = await apiClient.patch<Reminder>(
      `/reminders/${reminderId}`,
      payload,
    )
    return data
  },
  remove: async (reminderId: number): Promise<void> => {
    await apiClient.delete(`/reminders/${reminderId}`)
  },
}
