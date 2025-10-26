import axios from 'axios'
import { TravelBotRequest, TravelBotResponse } from '../types'

export class GigachatService {
  private static readonly API_URL = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions'
  private static readonly AUTH_URL = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth'

  private static async getAccessToken(): Promise<string> {
    const clientId = process.env.GIGACHAT_CLIENT_ID
    const clientSecret = process.env.GIGACHAT_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error('GIGACHAT credentials not configured')
    }

    try {
      const response = await axios.post(this.AUTH_URL, {
        client_id: clientId,
        client_secret: clientSecret,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      return response.data.access_token
    } catch (error) {
      console.error('GIGACHAT auth error:', error)
      throw new Error('Failed to authenticate with GIGACHAT')
    }
  }

  static async askQuestion(request: TravelBotRequest): Promise<TravelBotResponse> {
    try {
      const accessToken = await this.getAccessToken()

      const systemPrompt = `Ты - помощник по планированию путешествий Budget Compass. 
      Твоя задача - помогать пользователям с вопросами о путешествиях, бюджетах, городах и планировании поездок.
      
      Доступные города: Лиссабон, Стамбул, Тбилиси, Рига, Ереван, Будапешт, Прага, Краков, Бухарест, София, Белград, Загреб, Любляна, Братислава, Вильнюс, Таллин, Киев, Минск, Кишинев, Скопье.
      
      Отвечай на русском языке, будь дружелюбным и полезным. Если вопрос не связан с путешествиями, вежливо перенаправь разговор в нужное русло.`

      const response = await axios.post(
        this.API_URL,
        {
          model: 'GigaChat',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: request.question,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const answer = response.data.choices?.[0]?.message?.content || 'Извините, не удалось получить ответ от AI.'

      return { answer }
    } catch (error) {
      console.error('GIGACHAT API error:', error)
      
      // Fallback к локальным ответам
      return this.getFallbackResponse(request.question)
    }
  }

  private static getFallbackResponse(question: string): TravelBotResponse {
    const questionLower = question.toLowerCase().trim()

    const responses: Record<string, string> = {
      'где попробовать местную кухню':
        'Рекомендую посетить местные рынки и семейные рестораны. В Лиссабоне попробуйте паштел де ната, в Стамбуле - кебаб и баклаву, в Тбилиси - хачапури и хинкали.',
      'транспорт':
        'В большинстве городов удобно пользоваться общественным транспортом. Рекомендую приобрести дневные или недельные проездные билеты. В некоторых городах есть карты для туристов.',
      'достопримечательности':
        'Обязательно посетите исторический центр города, местные музеи и парки. Многие достопримечательности можно посмотреть бесплатно или со скидкой по студенческому билету.',
      'жилье':
        'Рекомендую бронировать жилье заранее. Хостелы - бюджетный вариант, апартаменты - для семей, отели - для комфорта. Сравнивайте цены на разных платформах.',
      'безопасность':
        'Все рекомендуемые города безопасны для туристов. Следуйте общим правилам безопасности: не носите с собой крупные суммы, следите за вещами, избегайте темных улиц ночью.',
      'бюджет':
        'Для экономии бюджета рекомендую: бронировать билеты заранее, выбирать жилье вдали от центра, готовить самим, пользоваться общественным транспортом, искать бесплатные развлечения.',
      'виза':
        'Для большинства европейских городов нужна шенгенская виза. Для Турции, Грузии, Армении виза не нужна для граждан РФ. Уточняйте актуальную информацию на официальных сайтах.',
    }

    // Ищем подходящий ответ
    for (const [key, answer] of Object.entries(responses)) {
      if (questionLower.includes(key)) {
        return { answer }
      }
    }

    // Общие ответы
    const generalAnswers = [
      'Это отличный вопрос! Рекомендую изучить местные блоги и форумы путешественников для получения актуальной информации.',
      'Для получения подробной информации советую обратиться к официальным туристическим сайтам города.',
      'Это зависит от ваших предпочтений и бюджета. Рекомендую составить план заранее и изучить отзывы других путешественников.',
      'Интересный вопрос! Попробуйте поискать информацию в местных группах в социальных сетях или туристических форумах.',
      'Рекомендую использовать наш сервис для поиска подходящих городов по вашему бюджету и предпочтениям.',
    ]

    const randomAnswer = generalAnswers[Math.floor(Math.random() * generalAnswers.length)]
    return { answer: randomAnswer }
  }
}
