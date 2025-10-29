export type CityId = string

export type BudgetBreakdown = {
  flights: number
  lodging: number
  food: number
  local: number // транспорт и развлечения
  buffer: number
}

export type City = {
  id: CityId
  name: string
  country: string
  lat: number
  lng: number
  avgDailyCost: number // усредненная дневная стоимость
  mockBudget: BudgetBreakdown // базовое распределение
  image?: string
}

export type SearchParams = {
  budget: number
  startDate: string
  endDate: string
  origin: string
  prefCulture: number // 0..100
  prefNature: number
  prefParty: number
}

export type SavedTrip = {
  id: string // uuid
  cityId: CityId
  params: SearchParams
  adjustedBudget: BudgetBreakdown
  total: number
  savedAt: string
  userId?: string
}

export type CurrencyRates = {
  USD: number
  EUR: number
  TRY: number
  GEL: number
  RUB: number
  PLN: number
  CZK: number
  HUF: number
  RON: number
  BGN: number
  RSD: number
  HRK: number
  ALL: number
  MKD: number
  UAH: number
  BYN: number
  MDL: number
  LTL: number
  LVL: number
  EEK: number
}

export type User = {
  id: string
  email: string
  password: string
  name: string
  createdAt: string
}

export type AuthRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  email: string
  password: string
  name: string
}

export type AuthResponse = {
  success: boolean
  token?: string
  user?: {
    id: string
    email: string
    name: string
  }
  error?: string
}

export type TravelBotRequest = {
  question: string
  country?: string
}

export type TravelBotResponse = {
  answer: string
}
