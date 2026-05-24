/**
 * Date and timezone helper functions for Asia/Kathmandu (UTC+05:45).
 * Naive date math breaks on Nepal's 45-minute offset.
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

export function getCurrentDateTimeInKathmandu(): string {
  // Timestamps are stored as UTC ISO-8601 strings
  return new Date().toISOString()
}

export function isPastDateInKathmandu(dateStr: string): boolean {
  const today = getTodayInKathmandu() // YYYY-MM-DD
  return dateStr < today
}
