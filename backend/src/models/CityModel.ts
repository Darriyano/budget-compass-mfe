import { City } from '../types'

export class CityModel {
  private static cities: City[] = [
    {
      id: 'lisbon',
      name: 'Лиссабон',
      country: 'Португалия',
      lat: 38.7223,
      lng: -9.1393,
      avgDailyCost: 95,
      mockBudget: { flights: 40, lodging: 30, food: 15, local: 10, buffer: 5 },
      image: '',
    },
    {
      id: 'istanbul',
      name: 'Стамбул',
      country: 'Турция',
      lat: 41.0082,
      lng: 28.9784,
      avgDailyCost: 70,
      mockBudget: { flights: 35, lodging: 25, food: 20, local: 10, buffer: 10 },
      image: '',
    },
    {
      id: 'tbilisi',
      name: 'Тбилиси',
      country: 'Грузия',
      lat: 41.7151,
      lng: 44.8271,
      avgDailyCost: 60,
      mockBudget: { flights: 30, lodging: 30, food: 20, local: 10, buffer: 10 },
      image: '',
    },
    {
      id: 'riga',
      name: 'Рига',
      country: 'Латвия',
      lat: 56.9496,
      lng: 24.1052,
      avgDailyCost: 80,
      mockBudget: { flights: 30, lodging: 35, food: 20, local: 10, buffer: 5 },
      image: '',
    },
    {
      id: 'yerevan',
      name: 'Ереван',
      country: 'Армения',
      lat: 40.1792,
      lng: 44.4991,
      avgDailyCost: 55,
      mockBudget: { flights: 35, lodging: 25, food: 20, local: 10, buffer: 10 },
      image: '',
    },
    {
      id: 'budapest',
      name: 'Будапешт',
      country: 'Венгрия',
      lat: 47.4979,
      lng: 19.0402,
      avgDailyCost: 75,
      mockBudget: { flights: 35, lodging: 30, food: 20, local: 10, buffer: 5 },
      image: '',
    },
    {
      id: 'prague',
      name: 'Прага',
      country: 'Чехия',
      lat: 50.0755,
      lng: 14.4378,
      avgDailyCost: 85,
      mockBudget: { flights: 40, lodging: 30, food: 20, local: 10, buffer: 5 },
      image: '',
    },
    {
      id: 'krakow',
      name: 'Краков',
      country: 'Польша',
      lat: 50.0647,
      lng: 19.9450,
      avgDailyCost: 65,
      mockBudget: { flights: 30, lodging: 25, food: 20, local: 10, buffer: 5 },
      image: '',
    },
    {
      id: 'bucharest',
      name: 'Бухарест',
      country: 'Румыния',
      lat: 44.4268,
      lng: 26.1025,
      avgDailyCost: 50,
      mockBudget: { flights: 30, lodging: 20, food: 15, local: 10, buffer: 5 },
      image: '',
    },
    {
      id: 'sofia',
      name: 'София',
      country: 'Болгария',
      lat: 42.6977,
      lng: 23.3219,
      avgDailyCost: 45,
      mockBudget: { flights: 30, lodging: 20, food: 15, local: 10, buffer: 5 },
      image: '',
    },
    {
      id: 'belgrade',
      name: 'Белград',
      country: 'Сербия',
      lat: 44.7866,
      lng: 20.4489,
      avgDailyCost: 55,
      mockBudget: { flights: 35, lodging: 25, food: 20, local: 10, buffer: 10 },
      image: '',
    },
    {
      id: 'zagreb',
      name: 'Загреб',
      country: 'Хорватия',
      lat: 45.8150,
      lng: 15.9819,
      avgDailyCost: 70,
      mockBudget: { flights: 35, lodging: 30, food: 20, local: 10, buffer: 5 },
      image: '',
    },
    {
      id: 'ljubljana',
      name: 'Любляна',
      country: 'Словения',
      lat: 46.0569,
      lng: 14.5058,
      avgDailyCost: 80,
      mockBudget: { flights: 40, lodging: 30, food: 20, local: 10, buffer: 10 },
      image: '',
    },
    {
      id: 'bratislava',
      name: 'Братислава',
      country: 'Словакия',
      lat: 48.1486,
      lng: 17.1077,
      avgDailyCost: 70,
      mockBudget: { flights: 35, lodging: 30, food: 20, local: 10, buffer: 5 },
      image: '',
    },
    {
      id: 'vilnius',
      name: 'Вильнюс',
      country: 'Литва',
      lat: 54.6872,
      lng: 25.2797,
      avgDailyCost: 75,
      mockBudget: { flights: 35, lodging: 30, food: 20, local: 10, buffer: 5 },
      image: '',
    },
    {
      id: 'tallinn',
      name: 'Таллин',
      country: 'Эстония',
      lat: 59.4370,
      lng: 24.7536,
      avgDailyCost: 85,
      mockBudget: { flights: 40, lodging: 30, food: 20, local: 10, buffer: 5 },
      image: '',
    },
    {
      id: 'kiev',
      name: 'Киев',
      country: 'Украина',
      lat: 50.4501,
      lng: 30.5234,
      avgDailyCost: 40,
      mockBudget: { flights: 25, lodging: 15, food: 15, local: 10, buffer: 5 },
      image: '',
    },
    {
      id: 'minsk',
      name: 'Минск',
      country: 'Беларусь',
      lat: 53.9006,
      lng: 27.5590,
      avgDailyCost: 45,
      mockBudget: { flights: 30, lodging: 20, food: 15, local: 10, buffer: 5 },
      image: '',
    },
    {
      id: 'chisinau',
      name: 'Кишинев',
      country: 'Молдова',
      lat: 47.0105,
      lng: 28.8638,
      avgDailyCost: 35,
      mockBudget: { flights: 25, lodging: 15, food: 15, local: 10, buffer: 5 },
      image: '',
    },
    {
      id: 'skopje',
      name: 'Скопье',
      country: 'Северная Македония',
      lat: 41.9981,
      lng: 21.4361,
      avgDailyCost: 50,
      mockBudget: { flights: 30, lodging: 20, food: 15, local: 10, buffer: 5 },
      image: '',
    },
  ]

  static getAllCities(): City[] {
    return [...this.cities]
  }

  static getCityById(id: string): City | undefined {
    return this.cities.find((city) => city.id === id)
  }

  static searchCities(searchParams: {
    budget: number
    startDate: string
    endDate: string
    prefCulture: number
    prefNature: number
    prefParty: number
  }): City[] {
    const days = Math.max(
      1,
      Math.ceil(
        (new Date(searchParams.endDate).getTime() -
          new Date(searchParams.startDate).getTime()) /
          86400000,
      ),
    )

    return this.cities
      .map((city) => ({
        ...city,
        totalCost: days * city.avgDailyCost,
        budgetFit: (searchParams.budget / (days * city.avgDailyCost)) * 100,
      }))
      .filter((city) => city.budgetFit >= 50) // фильтруем города, которые помещаются в бюджет
      .sort((a, b) => b.budgetFit - a.budgetFit) // сортируем по соответствию бюджету
  }
}
