import { CurrencyRates } from '../types'

export class CurrencyModel {
  private static rates: CurrencyRates = {
    USD: 1,
    EUR: 0.92,
    TRY: 34,
    GEL: 2.7,
  }

  static getRates(): CurrencyRates {
    return { ...this.rates }
  }

  static convertCurrency(
    amount: number,
    from: keyof CurrencyRates,
    to: keyof CurrencyRates,
  ): number {
    const usdAmount = amount / this.rates[from]
    return usdAmount * this.rates[to]
  }

  static updateRates(newRates: Partial<CurrencyRates>): void {
    this.rates = { ...this.rates, ...newRates }
  }
}
