import React, { useMemo, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useBudget } from '../context/BudgetContext'
import { apiService } from '../services/api'
import { City } from '../types'
import BudgetPie from '../components/BudgetPie'
import BudgetSlider from '../components/BudgetSlider'
import CurrencyConverter from '../components/CurrencyConverter'
import TravelBot from '../components/TravelBot'
import Toast from '../components/Toast'

function clamp01(x: number) {
  return Math.max(0, Math.min(100, x))
}

export default function CityDetail() {
  const [showToast, setShowToast] = useState(false)
  const [city, setCity] = useState<City | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { id } = useParams()
  const { params, setParams, adjusted, setAdjusted, saveTrip } = useBudget()

  useEffect(() => {
    const loadCity = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)
        const cityData = await apiService.getCityById(id)
        setCity(cityData)
      } catch (err) {
        console.error('Failed to load city:', err)
        setError('Не удалось загрузить информацию о городе')
      } finally {
        setLoading(false)
      }
    }

    loadCity()
  }, [id])

  const total = useMemo(() => params.budget, [params.budget])
  const apply = (key: keyof typeof adjusted) => (v: number) =>
    setAdjusted({ [key]: clamp01(v) } as any)
  const sum =
    adjusted.flights +
    adjusted.lodging +
    adjusted.food +
    adjusted.local +
    adjusted.buffer
  const overBudget = sum > 100

  if (loading) {
    return <div className="card">Загрузка информации о городе...</div>
  }

  if (error) {
    return (
      <div className="card" style={{ color: 'red' }}>
        {error}
      </div>
    )
  }

  if (!city) {
    return <div className="card">Город не найден</div>
  }

  return (
    <div className="grid cols-2">
      <div className="grid">
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 18 }}>{city.name}</div>
          <div className="chips">
            <span className="chip">{city.country}</span>
          </div>
        </div>
        <BudgetPie b={adjusted} />
        <div className="grid cols-2">
          <BudgetSlider
            label="Перелёты"
            value={adjusted.flights}
            onChange={apply('flights')}
          />
          <BudgetSlider
            label="Жильё"
            value={adjusted.lodging}
            onChange={apply('lodging')}
          />
          <BudgetSlider
            label="Еда"
            value={adjusted.food}
            onChange={apply('food')}
          />
          <BudgetSlider
            label="Местное"
            value={adjusted.local}
            onChange={apply('local')}
          />
          <BudgetSlider
            label="Резерв"
            value={adjusted.buffer}
            onChange={apply('buffer')}
          />
        </div>
        {overBudget && (
          <div className="card" style={{ background: '#fff4f4', border: '1px solid #f5c2c7' }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Вы вышли за рамки бюджета</div>
            <div style={{ marginBottom: 8 }}>Сумма категорий {sum}% превышает 100%. Вы можете изменить общий бюджет или переформировать проценты в чате.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label className="label">Изменить бюджет</label>
              <input
                className="input"
                type="number"
                value={total}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  if (!Number.isNaN(v)) {
                    setParams({ budget: v })
                  }
                }}
                style={{ maxWidth: 160 }}
              />
            </div>
          </div>
        )}
        <div className="card">
          <div className="label">Проверка суммы</div>
          <div>
            Сумма процентов: <b>{sum}%</b>
          </div>
          <div style={{ marginTop: 8 }}>
            Итого бюджет: <b>${total}</b>
          </div>
          <div className="grid cols-2" style={{ marginTop: 8 }}>
            <div className="card">
              <div className="label">Оценка по категориям</div>
              <ul>
                <li>
                  Перелёты: ${Math.round((total * adjusted.flights) / 100)}
                </li>
                <li>Жильё: ${Math.round((total * adjusted.lodging) / 100)}</li>
                <li>Еда: ${Math.round((total * adjusted.food) / 100)}</li>
                <li>Местное: ${Math.round((total * adjusted.local) / 100)}</li>
                <li>Резерв: ${Math.round((total * adjusted.buffer) / 100)}</li>
              </ul>
            </div>
            <CurrencyConverter />
          </div>
          <button
            className="btn"
            onClick={() => {
              saveTrip({
                cityId: city.id,
                params,
                adjustedBudget: adjusted,
                total,
              })
              setShowToast(true)
            }}
          >
            Сохранить вариант
          </button>
        </div>
      </div>
      <div className="grid">
        <TravelBot city={city} />
      </div>

      {showToast && (
        <Toast
          title="Сохранено"
          text="Вариант добавлен в список"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  )
}
