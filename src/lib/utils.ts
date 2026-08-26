/**
 * @file UI Utility Functions.
 * @description General-purpose helper functions for Tailwind CSS class combination and merging.
 */

import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple CSS class values safely using `clsx` and resolves Tailwind CSS class conflicts via `tailwind-merge`.
 *
 * @param inputs - Variable list of class values, objects, arrays, or conditionals.
 * @returns Deduplicated and merged Tailwind CSS class string.
 *
 * @example
 * ```tsx
 * <div className={cn('px-4 py-2 bg-blue-500', isSelected && 'bg-blue-700', customClassName)} />
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
