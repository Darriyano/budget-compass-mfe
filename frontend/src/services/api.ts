import { City, SavedTrip, CurrencyRates, TravelBotResponse, TravelBotRequest, BudgetBreakdown } from '../types'

const API_BASE_URL = 'http://localhost:5000/api'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data: ApiResponse<T> = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'API request failed')
      }

      return data.data as T
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Cities API
  async getCities(): Promise<City[]> {
    return this.request<City[]>('/cities')
  }

  async getCityById(id: string): Promise<City> {
    return this.request<City>(`/cities/${id}`)
  }

  async searchCities(params: {
    budget: number
    startDate: string
    endDate: string
    prefCulture?: number
    prefNature?: number
    prefParty?: number
  }): Promise<City[]> {
    const searchParams = new URLSearchParams()
    searchParams.append('budget', params.budget.toString())
    searchParams.append('startDate', params.startDate)
    searchParams.append('endDate', params.endDate)
    if (params.prefCulture !== undefined)
      searchParams.append('prefCulture', params.prefCulture.toString())
    if (params.prefNature !== undefined)
      searchParams.append('prefNature', params.prefNature.toString())
    if (params.prefParty !== undefined)
      searchParams.append('prefParty', params.prefParty.toString())

    return this.request<City[]>(`/cities/search?${searchParams.toString()}`)
  }

  // Trips API
  async getTrips(): Promise<SavedTrip[]> {
    return this.request<SavedTrip[]>('/trips')
  }

  async getTripById(id: string): Promise<SavedTrip> {
    return this.request<SavedTrip>(`/trips/${id}`)
  }

  async saveTrip(tripData: {
    cityId: string
    params: any
    adjustedBudget: any
    total: number
  }): Promise<SavedTrip> {
    return this.request<SavedTrip>('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    })
  }

  async deleteTrip(id: string): Promise<void> {
    return this.request<void>(`/trips/${id}`, {
      method: 'DELETE',
    })
  }

  // Currency API
  async getCurrencyRates(): Promise<CurrencyRates> {
    return this.request<CurrencyRates>('/currencies/rates')
  }

  async convertCurrency(
    amount: number,
    from: string,
    to: string,
  ): Promise<{
    amount: number
    from: string
    to: string
    result: number
  }> {
    return this.request<{
      amount: number
      from: string
      to: string
      result: number
    }>(`/currencies/convert?amount=${amount}&from=${from}&to=${to}`)
  }

  // TravelBot API
  async askTravelBot(payload: TravelBotRequest): Promise<TravelBotResponse> {
    return this.request<TravelBotResponse>('/travelbot/ask', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async rebalanceBudget(payload: {
    budget: number
    current: BudgetBreakdown
    lock: Array<'flights' | 'lodging' | 'food' | 'local' | 'buffer'>
    city?: { name: string; country?: string }
    preferences?: { culture?: number; nature?: number; party?: number }
    chatContext?: string
  }): Promise<{ breakdown: BudgetBreakdown; note?: string }> {
    return this.request<{ breakdown: BudgetBreakdown; note?: string }>(
      '/travelbot/rebalance',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    )
  }
}

export const apiService = new ApiService()
