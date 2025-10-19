import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import MiniPie from './MiniPie';
import { City } from '../types';

export default function CityCard({ city, budgetLeftPct }: { city: City; budgetLeftPct: number }) {
  const pie = [
    { name: 'Перелёты', value: city.mockBudget.flights },
    { name: 'Жильё', value: city.mockBudget.lodging },
    { name: 'Еда', value: city.mockBudget.food },
    { name: 'Местное', value: city.mockBudget.local },
    { name: 'Резерв', value: city.mockBudget.buffer },
  ];

  const budgetStatus = budgetLeftPct >= 100 ? 'success' : budgetLeftPct >= 80 ? 'warning' : 'danger';

  return (
    <div className="card city-card">
      <div className="city-card__header">
        <div className="city-card__info">
          <h3 className="city-card__name">{city.name}</h3>
          <span className="city-card__country">{city.country}</span>
        </div>
        <div className="city-card__chart">
          <MiniPie data={pie} />
        </div>
      </div>
      
      <div className="city-card__budget">
        <div className="city-card__budget-label">
          Бюджет покрыт: <span className={`budget-status budget-status--${budgetStatus}`}>
            {Math.round(budgetLeftPct)}%
          </span>
        </div>
        <ProgressBar value={budgetLeftPct} />
      </div>
      
      <div className="city-card__actions">
        <Link className="btn btn--outline" to={`/city/${city.id}`}>
          Подробнее
        </Link>
      </div>
    </div>
  );
}