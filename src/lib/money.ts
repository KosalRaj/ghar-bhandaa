/**
 * @file Nepalese Currency (NPR / Paisa) Conversion and Formatting Utilities.
 * @description Provides precise financial math utilities for converting between Nepalese Rupees (NPR)
 * and integer Paisa (1 NPR = 100 Paisa).
 *
 * @remarks
 * Invariant: All monetary amounts must be stored and processed as integer paisa in SQLite to eliminate
 * floating-point rounding inaccuracies. Fractional NPR numbers are only used for user inputs/display.
 */

/**
 * Converts a Nepalese Rupee (NPR) amount into integer Paisa.
 *
 * @param npr - Monetary amount in Nepalese Rupees (e.g. 15000.50).
 * @returns Equivalent amount rounded to the nearest integer Paisa (e.g. 1500050).
 *
 * @example
 * ```ts
 * const paisa = nprToPaisa(12500) // 1250000
 * ```
 */
export function nprToPaisa(npr: number): number {
  return Math.round(npr * 100)
}

/**
 * Converts an integer Paisa amount into decimal Nepalese Rupees (NPR).
 *
 * @param paisa - Monetary amount in integer Paisa (e.g. 1250000).
 * @returns Equivalent amount in NPR (e.g. 12500).
 *
 * @example
 * ```ts
 * const npr = paisaToNpr(1250000) // 12500
 * ```
 */
export function paisaToNpr(paisa: number): number {
  return paisa / 100
}

/**
 * Formats an integer Paisa value into a localized Nepalese currency string (`NPR 12,500.00`).
 *
 * @param paisa - Monetary amount in integer Paisa.
 * @returns Formatted currency string conforming to `en-NP` locale rules.
 *
 * @example
 * ```ts
 * const displayStr = formatNpr(1500000) // "NPR 15,000.00"
 * ```
 */
export function formatNpr(paisa: number): string {
  const npr = paisaToNpr(paisa)
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 2,
  }).format(npr)
}
