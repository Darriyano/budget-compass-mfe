import React, { useEffect, useMemo, useRef, useState } from 'react'
import { apiService } from '../services/api'
import { City, BudgetBreakdown } from '../types'
import { useBudget } from '../context/BudgetContext'

export default function TravelBot({ city }: { city?: City }) {
  const [q, setQ] = useState('Подскажи лучшие идеи для моей поездки')
  const [a, setA] = useState('Я готов помогать с вашими планами!')
  const [loading, setLoading] = useState(false)
  const { params, adjusted, setAdjusted, setParams } = useBudget() as any
  const prevAdjustRef = useRef<BudgetBreakdown | null>(null)
  const debTimer = useRef<number | null>(null)
  const greetedCityRef = useRef<string | null>(null)
  const touchedKeysRef = useRef<Set<'flights'|'lodging'|'food'|'local'|'buffer'>>(new Set())

  const contextCity = useMemo(() => {
    return city ? { name: city.name, country: city.country } : undefined
  }, [city])

  const handleAsk = async () => {
    if (!q.trim()) return

    setLoading(true)
    try {
      const response = await apiService.askTravelBot({
        question: q,
        origin: params.origin,
        city: contextCity,
        country: contextCity?.country,
        budget: params.budget,
        budgetBreakdown: adjusted,
        preferences: {
          culture: params.prefCulture,
          nature: params.prefNature,
          party: params.prefParty,
        },
        startDate: params.startDate,
        endDate: params.endDate,
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
    touchedKeysRef.current.add(evt.key)

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
          origin: params.origin,
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
          startDate: params.startDate,
          endDate: params.endDate,
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
          origin: params.origin,
          city: contextCity,
          country: contextCity?.country,
          budget: params.budget,
          budgetBreakdown: adjusted,
          preferences: {
            culture: params.prefCulture,
            nature: params.prefNature,
            party: params.prefParty,
          },
          startDate: params.startDate,
          endDate: params.endDate,
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
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <button
          className="btn btn--outline"
          disabled={loading}
          onClick={async () => {
            try {
              setLoading(true)
              const lock: Array<'flights'|'lodging'|'food'|'local'|'buffer'> = Array.from(touchedKeysRef.current)
              const res = await apiService.rebalanceBudget({
                budget: params.budget,
                current: adjusted,
                lock, // сохраняем пользовательские проценты
                city: contextCity,
                preferences: { culture: params.prefCulture, nature: params.prefNature, party: params.prefParty },
                chatContext: a,
              })
              setAdjusted(res.breakdown)
              setA('Обновил распределение бюджета на основе ваших выбранных процентов.')
            } catch (e) {
              setA('Не удалось пересчитать бюджет.')
            } finally {
              setLoading(false)
            }
          }}
        >Переформировать проценты (сохранить мои выборы)</button>

        <button
          className="btn btn--outline"
          disabled={loading}
          onClick={async () => {
            try {
              setLoading(true)
              const res = await apiService.rebalanceBudget({
                budget: params.budget,
                current: adjusted,
                lock: [],
                city: contextCity,
                preferences: { culture: params.prefCulture, nature: params.prefNature, party: params.prefParty },
                chatContext: a,
              })
              setAdjusted(res.breakdown)
              setA('Переформировал бюджет на основе диалога.')
            } catch (e) {
              setA('Не удалось переформировать бюджет на основе чата.')
            } finally {
              setLoading(false)
            }
          }}
        >Переформировать бюджет на основе чата</button>

        {city && (
          <button
            className="btn btn--outline"
            disabled={loading}
            onClick={async () => {
              const dates = `${params.startDate} — ${params.endDate}`
              const question = `Подбери оптимальные авиабилеты из ${params.origin} в ${city.name} (${city.country}) на даты ${dates}. Учитывай мой общий бюджет ${params.budget} и долю на перелёты ${adjusted.flights}%. Дай 3–5 вариантов с ориентирами по авиакомпаниям, аэропортам/пересадкам и ориентировочными ценами. Без реальных ссылок.`
              try {
                setLoading(true)
                const response = await apiService.askTravelBot({
                  question,
                  origin: params.origin,
                  city: contextCity,
                  country: contextCity?.country,
                  budget: params.budget,
                  budgetBreakdown: adjusted,
                  preferences: {
                    culture: params.prefCulture,
                    nature: params.prefNature,
                    party: params.prefParty,
                  },
                  startDate: params.startDate,
                  endDate: params.endDate,
                })
                setA(response.answer)
              } catch {
                setA('Не удалось найти билеты.')
              } finally {
                setLoading(false)
              }
            }}
          >Поиск билетов</button>
        )}
      </div>
      <div style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>{a}</div>
    </div>
  )
}
