import React, { useState } from 'react'
import { apiService } from '../services/api'

export default function TravelBot() {
  const [q, setQ] = useState('Где попробовать местную кухню?')
  const [country, setCountry] = useState('')
  const [a, setA] = useState(
    'Здесь будет ответ ассистента. Сейчас это статический текст.',
  )
  const [loading, setLoading] = useState(false)

  const handleAsk = async () => {
    if (!q.trim()) return

    setLoading(true)
    try {
      const response = await apiService.askTravelBot(q, country || undefined)
      setA(response.answer)
    } catch (error) {
      console.error('Failed to get answer:', error)
      setA('Извините, произошла ошибка при получении ответа.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="label">TravelBot</div>
      <input
        className="input"
        placeholder="Страна (опционально)"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        style={{ marginBottom: 8 }}
      />
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
