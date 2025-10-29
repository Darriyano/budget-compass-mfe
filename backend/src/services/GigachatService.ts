import axios from 'axios'
import crypto from 'crypto'
import https from 'https'
import { TravelBotRequest, TravelBotResponse } from '../types'

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
        ? `Город поездки: ${request.city.name}${request.city.country ? `, ${request.city.country}` : ''}.`
        : request.country
          ? `Страна поездки: ${request.country}.`
          : 'Локация не указана.'

      const budgetPart = request.budgetBreakdown
        ? `Распределение бюджета (%): Перелёты ${request.budgetBreakdown.flights}, Жильё ${request.budgetBreakdown.lodging}, Еда ${request.budgetBreakdown.food}, Местное ${request.budgetBreakdown.local}, Резерв ${request.budgetBreakdown.buffer}. Общий бюджет: ${request.budget ?? 'не указан'}.`
        : `Распределение бюджета не указано. Общий бюджет: ${request.budget ?? 'не указан'}.`

      const prefsPart = request.preferences
        ? `Предпочтения (0-100): Культура ${request.preferences.culture ?? 50}, Природа ${request.preferences.nature ?? 50}, Ночная жизнь ${request.preferences.party ?? 50}.`
        : 'Предпочтения не указаны.'

      const changePart = request.changeEvent
        ? `Изменение пользователя: ${labelByKey(request.changeEvent.key)}: ${request.changeEvent.oldValue}% → ${request.changeEvent.newValue}%. Дай уместные, конкретные советы.`
        : ''

      const systemPrompt = `Ты — внимательный и вежливый туристический ассистент. Отталкивайся от входных параметров бюджета и локации.

${cityPart}
${budgetPart}
${prefsPart}
${changePart}

Правила ответа:
- Предлагай кратко 3–6 конкретных рекомендаций с названиями мест, районами или ссылками-ориентирами (без реальных URL).
- Если доля категории уменьшилась, предложи способы экономии и альтернативы.
- Если доля категории выросла, предложи, куда потратить увеличенный бюджет с пользой.
- Учитывай местные особенности и сезонность, избегай общих фраз.`

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
