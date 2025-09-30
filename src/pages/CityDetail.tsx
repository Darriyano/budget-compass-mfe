import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { mockCities } from '../data/mockCities';
import { useBudget } from '../context/BudgetContext';
import BudgetPie from '../components/BudgetPie';
import BudgetSlider from '../components/BudgetSlider';
import CurrencyConverter from '../components/CurrencyConverter';
import TravelBot from '../components/TravelBot';
import Toast from '../components/Toast';

function clamp01(x: number) {
  return Math.max(0, Math.min(100, x));
}

export default function CityDetail() {
  const [showToast, setShowToast] = useState(false);
  const { id } = useParams();
  const city = mockCities.find(c => c.id === id);
  const { params, adjusted, setAdjusted, saveTrip } = useBudget();

  const total = useMemo(() => params.budget, [params.budget]);
  const apply = (key: keyof typeof adjusted) => (v: number) =>
    setAdjusted({ [key]: clamp01(v) } as any);
  const sum =
    adjusted.flights +
    adjusted.lodging +
    adjusted.food +
    adjusted.local +
    adjusted.buffer;

  if (!city) return <div className="card">Город не найден</div>;

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
        <div className="card">
          <div className="label">Проверка суммы</div>
          <div>
            Сумма процентов: <b>{sum}%</b>
          </div>
          <div style={{ marginTop: 8 }}>Итого бюджет: <b>${total}</b></div>
          <div className="grid cols-2" style={{ marginTop: 8 }}>
            <div className="card">
              <div className="label">Оценка по категориям</div>
              <ul>
                <li>Перелёты: ${Math.round(total * adjusted.flights / 100)}</li>
                <li>Жильё: ${Math.round(total * adjusted.lodging / 100)}</li>
                <li>Еда: ${Math.round(total * adjusted.food / 100)}</li>
                <li>Местное: ${Math.round(total * adjusted.local / 100)}</li>
                <li>Резерв: ${Math.round(total * adjusted.buffer / 100)}</li>
              </ul>
            </div>
            <CurrencyConverter />
          </div>
          <button
            className="btn"
            onClick={() => {
              saveTrip({ cityId: city.id, params, adjustedBudget: adjusted, total });
              setShowToast(true);
            }}
          >
            Сохранить вариант
          </button>
        </div>
      </div>
      <div className="grid">
        <TravelBot />
      </div>

      {showToast && (
        <Toast
          title="Сохранено"
          text="Вариант добавлен в список"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
