import React, { useMemo, useState } from 'react';


const RATES = { USD: 1, EUR: 0.92, TRY: 34, GEL: 2.7 }; // замокано


export default function CurrencyConverter(){
const [from, setFrom] = useState<'USD'|'EUR'|'TRY'|'GEL'>('USD');
const [to, setTo] = useState<'USD'|'EUR'|'TRY'|'GEL'>('EUR');
const [amount, setAmount] = useState(100);
const result = useMemo(() => (amount / RATES[from]) * RATES[to], [from, to, amount]);


return (
<div className="card">
<div className="grid cols-3" style={{alignItems:'end'}}>
<div>
<div className="label">Сумма</div>
<input className="input" type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} />
</div>
<div>
<div className="label">Из</div>
<select className="input" value={from} onChange={e=>setFrom(e.target.value as any)}>
{Object.keys(RATES).map(k=> <option key={k} value={k}>{k}</option>)}
</select>
</div>
<div>
<div className="label">В</div>
<select className="input" value={to} onChange={e=>setTo(e.target.value as any)}>
{Object.keys(RATES).map(k=> <option key={k} value={k}>{k}</option>)}
</select>
</div>
</div>
<div style={{marginTop:12,fontWeight:700}}>≈ {result.toFixed(2)} {to}</div>
</div>
);
}