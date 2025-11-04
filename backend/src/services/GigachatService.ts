import axios from 'axios'
import crypto from 'crypto'
import https from 'https'
import { RebalanceRequest, RebalanceResponse, TravelBotRequest, TravelBotResponse } from '../types'

function labelByKey(key: 'flights' | 'lodging' | 'food' | 'local' | 'buffer'): string {
  switch (key) {
    case 'flights':
      return 'Перелёты'
    case 'lodging':
      return 'Жильё'
    case 'food':
      return 'Еда'
    case 'local':
      return 'Местное'
    case 'buffer':
      return 'Резерв'
    default:
      return key
  }
}

function extractJson(text: string): any | null {
  try {
    const m = text.match(/\{[\s\S]*\}/)
    if (!m) return null
    return JSON.parse(m[0])
  } catch {
    return null
  }
}

function isValidBreakdown(x: any): x is { flights: number; lodging: number; food: number; local: number; buffer: number } {
  if (!x) return false
  const keys = ['flights','lodging','food','local','buffer']
  for (const k of keys) if (typeof x[k] !== 'number') return false
  const sum = keys.reduce((s,k)=>s + x[k], 0)
  return sum > 0 && Math.abs(sum - 100) < 1e-6
}

function deterministicRebalance(req: RebalanceRequest): { flights: number; lodging: number; food: number; local: number; buffer: number } {
  const keys: Array<'flights'|'lodging'|'food'|'local'|'buffer'> = ['flights','lodging','food','local','buffer']
  const lockSet = new Set(req.lock)
  const result: any = { ...req.current }
  for (const k of keys) if (lockSet.has(k)) result[k] = Math.max(0, Math.min(100, result[k] || 0))
  const lockedSum = keys.reduce((s,k)=> s + (lockSet.has(k) ? (result[k]||0) : 0), 0)
  const remainingKeys = keys.filter(k => !lockSet.has(k))
  const remaining = Math.max(0, 100 - lockedSum)
  const prefs = req.preferences || {}
  const ctx = (req.chatContext || '').toLowerCase()
  const mentions = {
    food: /(еда|рестора|кухн|food|restaurant|cuisine|ресторан)/.test(ctx) ? 1 : 0,
    lodging: /(жиль|отел|гостиниц|apartment|отель)/.test(ctx) ? 1 : 0,
    flights: /(перелет|билет|avia|flight|рейс)/.test(ctx) ? 1 : 0,
    local: /(экскурс|развлечен|активност|местн|транспорт|музей|park|парк)/.test(ctx) ? 1 : 0,
    buffer: /(резерв|страхов|непредвиден)/.test(ctx) ? 1 : 0,
  }
  const baseWeights: Record<typeof remainingKeys[number], number> = {
    flights: 1 + (prefs.culture || 0) * 0.001 + (mentions.flights ? 0.8 : 0),
    lodging: 1 + (prefs.culture || 0) * 0.001 + (mentions.lodging ? 0.8 : 0),
    food: 1.2 + (prefs.party || 0) * 0.003 + (mentions.food ? 1.5 : 0),
    local: 1.1 + (prefs.nature || 0) * 0.003 + (mentions.local ? 1.0 : 0),
    buffer: 0.8 + (mentions.buffer ? 0.5 : 0),
  } as any
  const weightSum = remainingKeys.reduce((s,k)=> s + (baseWeights[k] || 1), 0) || 1
  for (const k of remainingKeys) {
    result[k] = Math.max(0, (remaining * (baseWeights[k] || 1)) / weightSum)
  }
  const total = keys.reduce((s,k)=> s + result[k], 0)
  if (total !== 100) {
    const diff = 100 - total
    const target = 'buffer' in result ? 'buffer' : keys[0]
    result[target] = Math.max(0, result[target] + diff)
  }
  return result
}

export class GigachatService {
  private static cachedToken: string | null = null
  private static tokenExpiresAt = 0
  private static readonly OAUTH_URL = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth'
  private static readonly CHAT_URL = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions'
  private static readonly DEFAULT_SCOPE = 'GIGACHAT_API_PERS'
  private static readonly DEFAULT_MODEL = 'GigaChat'

  private static getHttpsAgent(): https.Agent {
    const tlsVerifyFlag = process.env.GIGACHAT_TLS_VERIFY
    const rejectUnauthorized = tlsVerifyFlag === '1' ? true : false
    return new https.Agent({ rejectUnauthorized })
  }

  static async rebalanceBudget(req: RebalanceRequest): Promise<RebalanceResponse> {
    try {
      const token = await this.getAccessToken()
      const system = `Ты помогаешь распределять бюджет путешествия по категориям.
Верни ТОЛЬКО JSON с полями flights,lodging,food,local,buffer (числа процентов, сумма ровно 100, без комментариев).
Сохрани зафиксированные категории без изменений: ${req.lock.join(', ')}.
Если в контексте чата явно упомянута категория (например еда, рестораны), отдай ей приоритет при перераспределении.`
      const city = req.city?.name ? `${req.city.name}${req.city.country ? ', ' + req.city.country : ''}` : 'не указан'
      const user = `Бюджет: ${req.budget}
Текущие проценты: ${JSON.stringify(req.current)}
Зафиксированы: ${req.lock.join(', ')}
Город: ${city}
Предпочтения: ${JSON.stringify(req.preferences || {})}
${req.chatContext ? 'Контекст: ' + req.chatContext : ''}
Пересчитай оставшиеся проценты так, чтобы сумма была 100, учитывая предпочтения.`
      const resp = await axios.post(this.CHAT_URL, {
        model: process.env.GIGACHAT_MODEL || this.DEFAULT_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.4,
        max_tokens: 256,
      }, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        httpsAgent: this.getHttpsAgent(),
        timeout: Number(process.env.GIGACHAT_TIMEOUT || 60) * 1000,
      })
      const text = resp.data?.choices?.[0]?.message?.content || ''
      const json = extractJson(text)
      if (json && isValidBreakdown(json)) {
        return { breakdown: json }
      }
    } catch (e) {
    }
    return { breakdown: deterministicRebalance(req) }
  }
  private static async getAccessToken(): Promise<string> {
    const now = Date.now()
    if (this.cachedToken && this.tokenExpiresAt > now + 60_000) {
      return this.cachedToken
    }

    const clientId = process.env.GIGACHAT_CLIENT_ID
    const clientSecret = process.env.GIGACHAT_SECRET || process.env.GIGACHAT_CLIENT_SECRET
    const scope = process.env.GIGACHAT_SCOPE || this.DEFAULT_SCOPE

    if (!clientId || !clientSecret) {
      throw new Error('GIGACHAT_CLIENT_ID or GIGACHAT_SECRET is not configured')
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    try {
      const response = await axios.post(
        this.OAUTH_URL,
        `scope=${encodeURIComponent(scope)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
            RqUID: crypto.randomUUID(),
            Authorization: `Basic ${auth}`,
          },
          httpsAgent: this.getHttpsAgent(),
          timeout: Number(process.env.GIGACHAT_TIMEOUT || 60) * 1000,
        },
      )

      const { access_token, expires_in } = response.data as { access_token: string; expires_in: number }
      this.cachedToken = access_token
      this.tokenExpiresAt = now + Math.max(0, (expires_in - 60)) * 1000
      return access_token
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 401 || status === 403) {
        const msg = 'GigaChat OAuth unauthorized: check GIGACHAT_CLIENT_ID/GIGACHAT_SECRET and SCOPE'
        console.error(msg, err?.response?.data)
        const e = new Error(msg)
        ;(e as any).status = status
        throw e
      }
      throw err
    }
  }

  static async askQuestion(request: TravelBotRequest): Promise<TravelBotResponse> {
    try {
      const token = await this.getAccessToken()

      const cityPart = request.city?.name
        ? `Маршрут: ${request.origin ?? 'город вылета не указан'} → ${request.city.name}${request.city.country ? `, ${request.city.country}` : ''}.`
        : request.country
          ? `Направление: ${request.country}.`
          : 'Локация не указана.'

      const budgetPart = request.budgetBreakdown
        ? `Распределение бюджета (%): Перелёты ${request.budgetBreakdown.flights}, Жильё ${request.budgetBreakdown.lodging}, Еда ${request.budgetBreakdown.food}, Местное ${request.budgetBreakdown.local}, Резерв ${request.budgetBreakdown.buffer}. Общий бюджет: ${request.budget ?? 'не указан'}.`
        : `Распределение бюджета не указано. Общий бюджет: ${request.budget ?? 'не указан'}.`

      const prefsPart = request.preferences
        ? `Предпочтения (0-100): Культура ${request.preferences.culture ?? 50}, Природа ${request.preferences.nature ?? 50}, Ночная жизнь ${request.preferences.party ?? 50}.`
        : 'Предпочтения не указаны.'

      const datesPart = request.startDate && request.endDate
        ? `Даты поездки: ${request.startDate} — ${request.endDate}.`
        : ''

      const flightsBudget = request.budget && request.budgetBreakdown?.flights
        ? Math.round((request.budget * request.budgetBreakdown.flights) / 100)
        : undefined
      const pricingHint = flightsBudget
        ? `Ориентируйся на бюджет на перелёты ≈ ${flightsBudget} USD. Указывай цены ориентировочно в USD с допуском ±20% от ${flightsBudget} USD.`
        : `Если уместно, указывай ориентировочные цены в USD.`

      const changePart = request.changeEvent
        ? `Изменение пользователя: ${labelByKey(request.changeEvent.key)}: ${request.changeEvent.oldValue}% → ${request.changeEvent.newValue}%. Дай уместные, конкретные советы.`
        : ''

      const systemPrompt = `Ты — внимательный и вежливый туристический ассистент. Отталкивайся от входных параметров бюджета и локации.

${cityPart}
${budgetPart}
${prefsPart}
${datesPart}
${pricingHint}
${changePart}

Правила ответа:
- Предлагай кратко 3–6 конкретных рекомендаций с названиями мест, районами или ссылками-ориентирами (без реальных URL).
- Если доля категории уменьшилась, предложи способы экономии и альтернативы.
- Если доля категории выросла, предложи, куда потратить увеличенный бюджет с пользой.
- Учитывай местные особенности и сезонность, избегай общих фраз.
- ВСЕГДА указывай реальные даты поездки (строго так: ${request.startDate ?? 'YYYY-MM-DD'} — ${request.endDate ?? 'YYYY-MM-DD'}) и явный маршрут (${request.origin ?? 'не указан'} → ${request.city?.name ?? 'не указан'}). НЕ используй формулировки вроде «указанные даты».`

      const resp = await axios.post(
        this.CHAT_URL,
        {
          model: process.env.GIGACHAT_MODEL || this.DEFAULT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: request.question },
          ],
          max_tokens: 1024,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          httpsAgent: this.getHttpsAgent(),
          timeout: Number(process.env.GIGACHAT_TIMEOUT || 60) * 1000,
        },
      )

      const answer = resp.data?.choices?.[0]?.message?.content || 'Извините, не удалось получить ответ от AI.'
      return { answer }
    } catch (error: any) {
      const status = error?.response?.status || error?.status
      if (status === 401 || status === 403) {
        console.error('GIGACHAT API unauthorized. Verify access token and scope.', error?.response?.data)
      } else {
        console.error('GIGACHAT API error:', error)
      }
      throw error
    }
  }
}
