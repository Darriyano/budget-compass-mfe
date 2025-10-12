import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';


export default function MiniPie({ data }:{ data: {name:string; value:number}[] }){
return (
<div style={{ width: 80, height: 80 }}>
<ResponsiveContainer>
<PieChart>
<Pie data={data} dataKey="value" nameKey="name" outerRadius={36} innerRadius={18} strokeWidth={0}>
{data.map((_, i) => (<Cell key={i} />))}
</Pie>
</PieChart>
</ResponsiveContainer>
</div>
);
}