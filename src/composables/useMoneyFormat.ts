/**
 * Returns a function that converts pence → formatted pounds,
 * e.g. 123456 → "£1,234.56".
 */
export function useMoneyFormat() {
  const fmt = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (pence: number | null | undefined): string => {
    if (pence == null) return '£0.00'
    return fmt.format(pence / 100)
  }
}
