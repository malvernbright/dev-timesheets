import { format, parseISO, startOfDay, subDays } from 'date-fns'

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  if (!hours) {
    return `${remaining}m`
  }
  if (!remaining) {
    return `${hours}h`
  }
  return `${hours}h ${remaining}m`
}

export function formatDate(value: string | Date, pattern = 'MMM d, yyyy'): string {
  const date = typeof value === 'string' ? parseISO(value) : value
  return format(date, pattern)
}

export function defaultReportRange() {
  const today = startOfDay(new Date())
  const weekAgo = subDays(today, 6)
  return {
    date_from: weekAgo.toISOString().slice(0, 10),
    date_to: today.toISOString().slice(0, 10),
  }
}

export function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function toDateTimeInputValue(date: Date): string {
  return date.toISOString().slice(0, 16)
}
