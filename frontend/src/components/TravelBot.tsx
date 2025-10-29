import React, { useEffect, useMemo, useRef, useState } from 'react'
import { apiService } from '../services/api'
import { City, BudgetBreakdown } from '../types'
import { useBudget } from '../context/BudgetContext'

export default function TravelBot({ city }: { city?: City }) {
  const [q, setQ] = useState('Подскажи лучшие идеи для моей поездки')
  const [a, setA] = useState('Я готов помогать с вашими планами!')
  const [loading, setLoading] = useState(false)
  const { params, adjusted } = useBudget()
  const prevAdjustRef = useRef<BudgetBreakdown | null>(null)
  const debTimer = useRef<number | null>(null)
  const greetedCityRef = useRef<string | null>(null)

  const contextCity = useMemo(() => {
    return city ? { name: city.name, country: city.country } : undefined
  }, [city])

  const handleAsk = async () => {
    if (!q.trim()) return

    setLoading(true)
    try {
      const response = await apiService.askTravelBot({
        question: q,
        city: contextCity,
        country: contextCity?.country,
        budget: params.budget,
        budgetBreakdown: adjusted,
        preferences: {
          culture: params.prefCulture,
          nature: params.prefNature,
          party: params.prefParty,
        },
      })
      setA(response.answer)
    } catch (error) {
      console.error('Failed to get answer:', error)
      setA('Извините, произошла ошибка при получении ответа.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-suggestions on slider changes
  useEffect(() => {
    const prev = prevAdjustRef.current
    prevAdjustRef.current = adjusted
    if (!prev) return

    const keys: Array<keyof BudgetBreakdown> = ['flights', 'lodging', 'food', 'local', 'buffer']
    const changedKey = keys.find((k) => prev[k] !== adjusted[k])
    if (!changedKey) return

    const evt = {
      key: changedKey as 'flights' | 'lodging' | 'food' | 'local' | 'buffer',
      oldValue: prev[changedKey],
      newValue: adjusted[changedKey],
    }

    const genQuestion = (k: typeof evt.key, oldV: number, newV: number) => {
      const dir = newV > oldV ? 'увеличил' : 'уменьшил'
      switch (k) {
        case 'food':
          return `Пользователь ${dir} долю на Еда c ${oldV}% до ${newV}%. Предложи конкретные рестораны, рынки и блюда в этом городе.`
        case 'lodging':
          return `Пользователь ${dir} долю на Жильё c ${oldV}% до ${newV}%. Дай варианты размещения с учётом изменения бюджета.`
        case 'flights':
          return `Пользователь ${dir} долю на Перелёты c ${oldV}% до ${newV}%. Подскажи, как оптимизировать перелёты/на что обратить внимание.`
        case 'local':
          return `Пользователь ${dir} долю на Местное c ${oldV}% до ${newV}%. Предложи локальные активности, транспорт и развлечения.`
        case 'buffer':
          return `Пользователь ${dir} долю на Резерв c ${oldV}% до ${newV}%. Дай советы по резерву и страхованию.`
      }
    }

    const question = genQuestion(evt.key, evt.oldValue, evt.newValue)
    if (!question) return

    if (debTimer.current) window.clearTimeout(debTimer.current)
    debTimer.current = window.setTimeout(async () => {
      try {
        setLoading(true)
        const response = await apiService.askTravelBot({
          question,
          city: contextCity,
          country: contextCity?.country,
          budget: params.budget,
          budgetBreakdown: adjusted,
          preferences: {
            culture: params.prefCulture,
            nature: params.prefNature,
            party: params.prefParty,
          },
          changeEvent: evt,
        })
        setA(response.answer)
      } catch (e) {
        // ignore auto-suggest errors silently
      } finally {
        setLoading(false)
      }
    }, 500)

    // cleanup not necessary here beyond timer
  }, [adjusted, contextCity, params.budget, params.prefCulture, params.prefNature, params.prefParty])

  // Initial greeting when entering city page, tailored by preferences
  useEffect(() => {
    if (!city) return
    if (greetedCityRef.current === city.id) return
    greetedCityRef.current = city.id
    const question = `Составь короткое приветственное сообщение для путешественника в городе ${city.name}. Встрои 3-5 персональных рекомендаций, учитывая предпочтения: культура ${params.prefCulture}%, природа ${params.prefNature}%, ночная жизнь ${params.prefParty}%.`
    ;(async () => {
      try {
        setLoading(true)
        const response = await apiService.askTravelBot({
          question,
          city: contextCity,
          country: contextCity?.country,
          budget: params.budget,
          budgetBreakdown: adjusted,
          preferences: {
            culture: params.prefCulture,
            nature: params.prefNature,
            party: params.prefParty,
          },
        })
        setA(response.answer)
      } catch {
        // ignore greeting failures
      } finally {
        setLoading(false)
      }
    })()
  }, [city, contextCity, params.prefCulture, params.prefNature, params.prefParty, params.budget, adjusted])

  return (
    <div className="card">
      <div className="label">TravelBot</div>
      <textarea
        className="input textarea"
        rows={3}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button
        className="btn"
        style={{ marginTop: 8 }}
        onClick={handleAsk}
        disabled={loading}
      >
        {loading ? 'Загрузка...' : 'Спросить'}
      </button>
      <div style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>{a}</div>
    </div>
  )
}
