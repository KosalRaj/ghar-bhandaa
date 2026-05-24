/**
 * Currency helpers for Nepalese Rupees (NPR) and Paisa (1 NPR = 100 Paisa).
 * All money values are stored as integer paisa in the database to prevent floating-point errors.
 */

export function nprToPaisa(npr: number): number {
  return Math.round(npr * 100)
}

export function paisaToNpr(paisa: number): number {
  return paisa / 100
}

export function formatNpr(paisa: number): string {
  const npr = paisaToNpr(paisa)
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 2,
  }).format(npr)
}
