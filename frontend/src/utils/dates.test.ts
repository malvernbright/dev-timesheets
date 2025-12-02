import { describe, expect, it } from 'vitest'
import { formatMinutes } from './dates'

describe('formatMinutes', () => {
  it('formats minutes into hours and minutes', () => {
    expect(formatMinutes(90)).toBe('1h 30m')
    expect(formatMinutes(60)).toBe('1h')
    expect(formatMinutes(45)).toBe('45m')
  })
})
