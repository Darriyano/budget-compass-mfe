import React, { useMemo } from 'react';
import MapView from '../components/MapView';
import CityCard from '../components/CityCard';
import { mockCities } from '../data/mockCities';
import { useBudget } from '../context/BudgetContext';


function daysBetween(a: string, b: string){ return Math.max(1, Math.ceil((new Date(b).getTime()-new Date(a).getTime())/86400000)); }


export default function Results(){
const { params } = useBudget();
const { list, leftPct } = useMemo(() => {
const days = daysBetween(params.startDate, params.endDate);
const totals = mockCities.map(c => ({ c, total: days * c.avgDailyCost }));
return {
list: totals,
leftPct: (total:number) => Math.min(100, (params.budget / total) * 100)
};
}, [params]);


return (
<div className="grid cols-2">
<MapView cities={mockCities} />
<div className="grid">
{list.map(it => (
<CityCard key={it.c.id} city={it.c} budgetLeftPct={leftPct(it.total)} />
))}
</div>
</div>
);
}