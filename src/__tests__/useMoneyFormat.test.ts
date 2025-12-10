import { describe, expect, it } from 'vitest'
import { useMoneyFormat } from '../composables/useMoneyFormat'

describe('useMoneyFormat', () => {
  it('formats pence to £ string', () => {
    const money = useMoneyFormat()
    expect(money(123456)).toBe('£1,234.56')
    expect(money(-987)).toBe('-£9.87')
  })

  it('handles null and undefined values', () => {
    const money = useMoneyFormat()
    expect(money(null)).toBe('£0.00')
    expect(money(undefined)).toBe('£0.00')
  })

  it('formats zero correctly', () => {
    const money = useMoneyFormat()
    expect(money(0)).toBe('£0.00')
  })

  it('formats large amounts correctly', () => {
    const money = useMoneyFormat()
    expect(money(123456789)).toBe('£1,234,567.89')
  })

  it('formats negative amounts correctly', () => {
    const money = useMoneyFormat()
    expect(money(-123456)).toBe('-£1,234.56')
  })
})
