import React, { useState } from 'react';


export default function TravelBot(){
const [q, setQ] = useState('Где попробовать местную кухню?');
const [a, setA] = useState('Здесь будет ответ ассистента. Сейчас это статический текст.');
return (
<div className="card">
<div className="label">TravelBot (мок)</div>
<textarea className="input textarea" rows={3} value={q} onChange={e=>setQ(e.target.value)} />
<button className="btn" style={{marginTop:8}} onClick={()=>setA(`(мок) Ответ на: "${q}"`)}>Спросить</button>
<div style={{marginTop:10,whiteSpace:'pre-wrap'}}>{a}</div>
</div>
);
}