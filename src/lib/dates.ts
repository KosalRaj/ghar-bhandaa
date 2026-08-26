/**
 * @file Nepal / Asia/Kathmandu Date and Timezone Utilities.
 * @description Provides date manipulation and timezone helpers anchored strictly to `Asia/Kathmandu` (UTC+05:45).
 *
 * @remarks
 * Invariant: All billing cycles, invoice due date checks, and overdue calculations must be evaluated
 * against the Kathmandu timezone. Standard UTC or naive date math fails on Nepal's +05:45 offset.
 */

/**
 * Returns today's calendar date in the `Asia/Kathmandu` timezone formatted as `YYYY-MM-DD`.
 *
 * @returns Today's date string in `YYYY-MM-DD` format according to Nepal local time.
 *
 * @example
 * ```ts
 * const today = getTodayInKathmandu() // e.g. "2026-08-26"
 * ```
 */
export function getTodayInKathmandu(): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kathmandu',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = formatter.formatToParts(new Date())
  const year = parts.find((p) => p.type === 'year')?.value
  const month = parts.find((p) => p.type === 'month')?.value
  const day = parts.find((p) => p.type === 'day')?.value
  return `${year}-${month}-${day}`
}

/**
 * Returns the current date and time as a standard UTC ISO-8601 string.
 * Used for database audit timestamps (`createdAt`, `updatedAt`, `sentAt`).
 *
 * @returns Current UTC timestamp in ISO-8601 string format (e.g. `2026-08-26T07:05:00.000Z`).
 */
export function getCurrentDateTimeInKathmandu(): string {
  // Timestamps are stored as UTC ISO-8601 strings
  return new Date().toISOString()
}

/**
 * Determines whether a given `YYYY-MM-DD` date string is strictly in the past relative
 * to today's date in `Asia/Kathmandu`.
 *
 * @param dateStr - Target date string in `YYYY-MM-DD` format.
 * @returns `true` if `dateStr` is earlier than today in Kathmandu, `false` otherwise.
 *
 * @example
 * ```ts
 * const overdue = isPastDateInKathmandu(invoice.dueDate)
 * ```
 */
export function isPastDateInKathmandu(dateStr: string): boolean {
  const today = getTodayInKathmandu() // YYYY-MM-DD
  return dateStr < today
}

/**
 * Adds or subtracts a specified number of calendar days to a base date (or current date in Kathmandu)
 * and returns the resulting date formatted as `YYYY-MM-DD` in `Asia/Kathmandu`.
 *
 * @param days - Number of days to add (can be positive, negative, or zero).
 * @param fromDateStr - Optional base date string formatted as `YYYY-MM-DD`. If omitted, defaults to the current instant.
 * @returns The computed date string in `YYYY-MM-DD` format in `Asia/Kathmandu` timezone.
 *
 * @example
 * ```ts
 * const futureDate = addDaysInKathmandu(7, '2026-08-20') // "2026-08-27"
 * ```
 */
export function addDaysInKathmandu(days: number, fromDateStr?: string): string {
  let targetTime: Date
  if (fromDateStr) {
    const [y, m, d] = fromDateStr.split('-').map(Number)
    // Kathmandu is UTC+5:45 (345 minutes offset)
    const utcMs = Date.UTC(y, m - 1, d) - 345 * 60 * 1000
    targetTime = new Date(utcMs + days * 24 * 60 * 60 * 1000)
  } else {
    targetTime = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kathmandu',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = formatter.formatToParts(targetTime)
  const year = parts.find((p) => p.type === 'year')?.value
  const month = parts.find((p) => p.type === 'month')?.value
  const day = parts.find((p) => p.type === 'day')?.value
  return `${year}-${month}-${day}`
}
