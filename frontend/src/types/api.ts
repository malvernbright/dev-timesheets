export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: 'bearer'
}

export interface User {
  id: number
  email: string
  full_name: string | null
  timezone: string
  is_active: boolean
  is_superuser: boolean
  created_at: string
}

export interface Project {
  id: number
  name: string
  description: string | null
  color: string | null
  is_archived: boolean
  created_at: string
}

export interface ProjectPayload {
  name: string
  description?: string | null
  color?: string | null
}

export interface TimeEntry {
  id: number
  user_id: number
  project_id: number
  description: string | null
  started_at: string
  ended_at: string | null
  duration_minutes: number
  is_billable: boolean
  hourly_rate: number | null
}

export interface TimeEntryPayload {
  project_id: number
  description?: string | null
  started_at: string
  ended_at?: string | null
  duration_minutes: number
  is_billable: boolean
  hourly_rate?: number | null
}

export interface ReportFiltersPayload {
  project_ids?: number[] | null
  date_from: string
  date_to: string
}

export type ExportFormat = 'csv' | 'pdf'

export interface ExportRequestPayload extends ReportFiltersPayload {
  format: ExportFormat
}

export interface ReportSummaryRow {
  project_id: number
  project_name: string
  total_minutes: number
  total_billable_minutes: number
}

export interface ReportResponse {
  summary: ReportSummaryRow[]
  total_minutes: number
  total_billable_minutes: number
}

export interface ReportExport {
  id: number
  format: ExportFormat
  status: string
  file_path: string | null
}

export interface Reminder {
  id: number
  label: string
  cron_expression: string
  channel: string
  is_active: boolean
}

export interface ReminderPayload {
  label: string
  cron_expression: string
  channel: string
  is_active: boolean
}

export interface IntegrationToken {
  id: number
  provider: string
  details: string | null
}

export interface IntegrationPayload {
  provider: string
  access_token: string
  details?: string | null
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  full_name?: string | null
  timezone?: string
}
