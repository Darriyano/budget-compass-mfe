import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useBudget } from '../context/BudgetContext'
import { apiService } from '../services/api'
import { City } from '../types'

export default function SavedTrips() {
  const { saved, removeTrip } = useBudget()
  const [cities, setCities] = useState<City[]>([])

  useEffect(() => {
    const loadCities = async () => {
      try {
        const citiesData = await apiService.getCities()
        setCities(citiesData)
      } catch (error) {
        console.error('Failed to load cities:', error)
      }
    }
    loadCities()
  }, [])

  const cityName = (id: string) => cities.find((c) => c.id === id)?.name || id

  return (
    <div className="card">
      <div className="label" style={{ marginBottom: 8 }}>
        Сохранённые поездки
      </div>
      {saved.length === 0 && <div>Пусто</div>}
      {saved.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Город</th>
              <th>Итого, $</th>
              <th>Дата</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {saved.map((it) => (
              <tr key={it.id}>
                <td>
                  <Link className="link" to={`/city/${it.cityId}`}>
                    {cityName(it.cityId)}
                  </Link>
                </td>
                <td>{it.total}</td>
                <td>{new Date(it.savedAt).toLocaleString()}</td>
                <td>
                  <button
                    className="btn secondary"
                    onClick={() => removeTrip(it.id)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
