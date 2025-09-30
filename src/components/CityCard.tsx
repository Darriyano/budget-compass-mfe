import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import MiniPie from './MiniPie';
import { City } from '../types';


export default function CityCard({ city, budgetLeftPct }:{ city: City; budgetLeftPct: number }){
const pie = [
{ name: 'Перелёты', value: city.mockBudget.flights },
{ name: 'Жильё', value: city.mockBudget.lodging },
{ name: 'Еда', value: city.mockBudget.food },
{ name: 'Местное', value: city.mockBudget.local },
{ name: 'Резерв', value: city.mockBudget.buffer },
];
return (
<div className="card">
<div className="card__row" style={{marginBottom:8}}>
<div>
<div style={{fontWeight:700}}>{city.name}</div>
<div className="chip">{city.country}</div>
</div>
<MiniPie data={pie} />
</div>
<div style={{marginBottom:8}} className="label">Бюджет покрыт: {Math.round(budgetLeftPct)}%</div>
<ProgressBar value={budgetLeftPct} />
<div style={{marginTop:12}}>
<Link className="link" to={`/city/${city.id}`}>Детализация</Link>
</div>
</div>
);
}