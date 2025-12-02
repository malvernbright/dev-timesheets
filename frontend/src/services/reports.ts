import { apiClient } from './api-client'
import type {
  ExportRequestPayload,
  ReportExport,
  ReportFiltersPayload,
  ReportResponse,
} from '@/types'

export const reportsApi = {
  summarize: async (payload: ReportFiltersPayload): Promise<ReportResponse> => {
    const { data } = await apiClient.post<ReportResponse>(
      '/reports/summary',
      payload,
    )
    return data
  },
  requestExport: async (payload: ExportRequestPayload): Promise<ReportExport> => {
    const { data } = await apiClient.post<ReportExport>(
      '/reports/export',
      payload,
    )
    return data
  },
  listExports: async (): Promise<ReportExport[]> => {
    const { data } = await apiClient.get<ReportExport[]>('/reports/exports')
    return data
  },
}
