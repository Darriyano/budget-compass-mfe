import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBudget } from '../context/BudgetContext';


export default function Home(){
const { params, setParams } = useBudget();
const nav = useNavigate();


const onCalc = () => nav('/results');


return (
<div className="grid cols-2">
<div className="card">
<div className="grid cols-2">
<div>
<div className="label">Бюджет, $</div>
<input className="input" type="number" value={params.budget} onChange={e=>setParams({ budget: Number(e.target.value) })} />
</div>
<div>
<div className="label">Город вылета</div>
<input className="input" value={params.origin} onChange={e=>setParams({ origin: e.target.value })} />
</div>
<div>
<div className="label">Дата начала</div>
<input className="input" type="date" value={params.startDate} onChange={e=>setParams({ startDate: e.target.value })} />
</div>
<div>
<div className="label">Дата конца</div>
<input className="input" type="date" value={params.endDate} onChange={e=>setParams({ endDate: e.target.value })} />
</div>
</div>
</div>


<div className="card">
<div className="label">Предпочтения</div>
<div className="grid cols-3">
<div>
<div className="label">Культура: {params.prefCulture}%</div>
<input className="input" type="range" min={0} max={100} value={params.prefCulture} onChange={e=>setParams({ prefCulture: Number(e.target.value) })} />
</div>
<div>
<div className="label">Природа: {params.prefNature}%</div>
<input className="input" type="range" min={0} max={100} value={params.prefNature} onChange={e=>setParams({ prefNature: Number(e.target.value) })} />
</div>
<div>
<div className="label">Ночная жизнь: {params.prefParty}%</div>
<input className="input" type="range" min={0} max={100} value={params.prefParty} onChange={e=>setParams({ prefParty: Number(e.target.value) })} />
</div>
</div>
<button className="btn" style={{marginTop:12}} onClick={onCalc}>Рассчитать</button>
</div>
</div>
);
}