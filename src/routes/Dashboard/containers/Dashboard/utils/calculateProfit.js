import Decimal from 'decimal.js'
import calcShareWinnings from './calcShareWinnings'

const calculateProfit = (share) => {
  if (share.resolved) {
    return calcShareWinnings(share, share.market)
  }

  return new Decimal(share.balance).mul(share.marginalPrice)
}

export default calculateProfit
