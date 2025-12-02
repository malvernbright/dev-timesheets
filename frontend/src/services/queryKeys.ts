export const queryKeys = {
  projects: ['projects'] as const,
  timeEntries: (filtersKey: string) => ['timeEntries', filtersKey] as const,
  reportsSummary: (filtersKey: string) => ['reportsSummary', filtersKey] as const,
  exports: ['reportExports'] as const,
  reminders: ['reminders'] as const,
  integrations: ['integrations'] as const,
  me: ['me'] as const,
}
