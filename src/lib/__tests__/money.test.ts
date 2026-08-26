import { describe, it, expect } from 'vitest'
import { nprToPaisa, paisaToNpr, formatNpr } from '../money'

describe('money utility (Integer Paisa Invariants)', () => {
  describe('nprToPaisa', () => {
    it('converts standard whole NPR amounts to integer paisa', () => {
      expect(nprToPaisa(1)).toBe(100)
      expect(nprToPaisa(100)).toBe(10000)
      expect(nprToPaisa(12000)).toBe(1200000)
      expect(nprToPaisa(0)).toBe(0)
    })

    it('converts decimal NPR amounts to exact paisa', () => {
      expect(nprToPaisa(0.01)).toBe(1)
      expect(nprToPaisa(0.5)).toBe(50)
      expect(nprToPaisa(0.99)).toBe(99)
      expect(nprToPaisa(12000.5)).toBe(1200050)
      expect(nprToPaisa(15420.75)).toBe(1542075)
    })

    it('avoids floating-point IEEE-754 precision inaccuracies using Math.round', () => {
      // 19.99 * 100 in JS is 1998.9999999999998
      expect(19.99 * 100).not.toBe(1999)
      expect(nprToPaisa(19.99)).toBe(1999)

      // 59.95 * 100 in JS is 5995.000000000001
      expect(nprToPaisa(59.95)).toBe(5995)

      // 1.15 * 100 in JS is 114.99999999999999
      expect(nprToPaisa(1.15)).toBe(115)
    })

    it('rounds sub-paisa amounts to nearest integer paisa', () => {
      expect(nprToPaisa(10.004)).toBe(1000)
      expect(nprToPaisa(10.006)).toBe(1001)
    })
  })

  describe('paisaToNpr', () => {
    it('converts integer paisa to NPR', () => {
      expect(paisaToNpr(100)).toBe(1)
      expect(paisaToNpr(10000)).toBe(100)
      expect(paisaToNpr(1200000)).toBe(12000)
      expect(paisaToNpr(1200050)).toBe(12000.5)
      expect(paisaToNpr(1)).toBe(0.01)
      expect(paisaToNpr(0)).toBe(0)
    })

    it('guarantees round-trip equality for valid paisa integers', () => {
      const testCases = [0, 1, 50, 99, 100, 1999, 1200000, 987654321]
      for (const paisa of testCases) {
        expect(nprToPaisa(paisaToNpr(paisa))).toBe(paisa)
      }
    })
  })

  describe('formatNpr', () => {
    it('formats paisa into NPR currency string with two decimals', () => {
      const formatted = formatNpr(1200000)
      // Intl format may vary slightly by ICU data (e.g. "NPR 12,000.00" or "Rs. 12,000.00" or "NPR 12,000.00")
      expect(formatted).toMatch(/12,000\.00/)
      expect(formatted).toMatch(/NPR|रू|Rs/)
    })

    it('formats zero paisa', () => {
      const formatted = formatNpr(0)
      expect(formatted).toMatch(/0\.00/)
    })

    it('formats fractional NPR amounts', () => {
      const formatted = formatNpr(1200050)
      expect(formatted).toMatch(/12,000\.50/)
    })

    it('formats small amounts', () => {
      const formatted = formatNpr(50)
      expect(formatted).toMatch(/0\.50/)
    })
  })
})
