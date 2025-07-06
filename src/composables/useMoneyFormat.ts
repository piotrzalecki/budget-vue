export const useMoneyFormat = () => {
  const fmt = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  })

  return (pence: number) => fmt.format(pence / 100)
}
