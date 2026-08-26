import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getTodayInKathmandu,
  getCurrentDateTimeInKathmandu,
  isPastDateInKathmandu,
  addDaysInKathmandu,
} from '../dates'

describe('dates utility (Asia/Kathmandu UTC+05:45)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getTodayInKathmandu', () => {
    it('returns date in YYYY-MM-DD format', () => {
      vi.setSystemTime(new Date('2026-05-15T12:00:00Z'))
      const today = getTodayInKathmandu()
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(today).toBe('2026-05-15')
    })

    it('handles Nepal UTC+05:45 timezone boundary before UTC midnight', () => {
      // 18:30 UTC on May 15th is 00:15 NPT on May 16th (+5:45)
      vi.setSystemTime(new Date('2026-05-15T18:30:00Z'))
      expect(getTodayInKathmandu()).toBe('2026-05-16')
    })

    it('handles Nepal UTC+05:45 timezone boundary during UTC late evening', () => {
      // 18:14 UTC on May 15th is 23:59 NPT on May 15th
      vi.setSystemTime(new Date('2026-05-15T18:14:00Z'))
      expect(getTodayInKathmandu()).toBe('2026-05-15')

      // 18:15 UTC on May 15th is 00:00 NPT on May 16th
      vi.setSystemTime(new Date('2026-05-15T18:15:00Z'))
      expect(getTodayInKathmandu()).toBe('2026-05-16')
    })

    it('handles early morning UTC correctly in Kathmandu', () => {
      // 01:00 UTC on May 15th is 06:45 NPT on May 15th
      vi.setSystemTime(new Date('2026-05-15T01:00:00Z'))
      expect(getTodayInKathmandu()).toBe('2026-05-15')
    })
  })

  describe('getCurrentDateTimeInKathmandu', () => {
    it('returns valid ISO-8601 UTC timestamp', () => {
      const fixedDate = new Date('2026-08-26T06:45:00.000Z')
      vi.setSystemTime(fixedDate)
      const iso = getCurrentDateTimeInKathmandu()
      expect(iso).toBe('2026-08-26T06:45:00.000Z')
      expect(new Date(iso).getTime()).toBe(fixedDate.getTime())
    })
  })

  describe('isPastDateInKathmandu', () => {
    beforeEach(() => {
      // Set fixed time: 2026-06-15 10:00 UTC (15:45 NPT)
      vi.setSystemTime(new Date('2026-06-15T10:00:00Z'))
    })

    it('returns true for past dates', () => {
      expect(isPastDateInKathmandu('2026-06-14')).toBe(true)
      expect(isPastDateInKathmandu('2026-05-31')).toBe(true)
      expect(isPastDateInKathmandu('2025-12-31')).toBe(true)
    })

    it('returns false for current date', () => {
      expect(isPastDateInKathmandu('2026-06-15')).toBe(false)
    })

    it('returns false for future dates', () => {
      expect(isPastDateInKathmandu('2026-06-16')).toBe(false)
      expect(isPastDateInKathmandu('2026-07-01')).toBe(false)
      expect(isPastDateInKathmandu('2027-01-01')).toBe(false)
    })
  })

  describe('addDaysInKathmandu', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2026-05-10T06:00:00Z'))
    })

    it('adds positive days relative to current Kathmandu date', () => {
      expect(addDaysInKathmandu(7)).toBe('2026-05-17')
      expect(addDaysInKathmandu(1)).toBe('2026-05-11')
      expect(addDaysInKathmandu(0)).toBe('2026-05-10')
    })

    it('subtracts days when given negative number', () => {
      expect(addDaysInKathmandu(-1)).toBe('2026-05-09')
      expect(addDaysInKathmandu(-10)).toBe('2026-04-30')
    })

    it('adds days relative to specified fromDateStr', () => {
      expect(addDaysInKathmandu(7, '2026-05-25')).toBe('2026-06-01')
      expect(addDaysInKathmandu(30, '2026-01-01')).toBe('2026-01-31')
    })

    it('handles leap years correctly', () => {
      expect(addDaysInKathmandu(1, '2024-02-28')).toBe('2024-02-29')
      expect(addDaysInKathmandu(2, '2024-02-28')).toBe('2024-03-01')
      expect(addDaysInKathmandu(1, '2026-02-28')).toBe('2026-03-01')
    })
  })
})
