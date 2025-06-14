'use client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useEffect, useState } from 'react';
import styles from './../../src/app/dashboard/dashboard.module.css';

const rangeOptions = [
{ label: '7 Ditët e Fundit', value: '7d' },
{ label: 'Muaji i Fundit', value: '1m' },
{ label: '6 Muajt e Fundit', value: '6m' },
{ label: 'Viti i Fundit', value: '1y' },

];

export default function SalesOverview() {
  const [range, setRange] = useState('7d');
  const [salesData, setSalesData] = useState<{ day: string; value: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/dashboard/sales-overview?range=${range}`);
      const data = await res.json();
      setSalesData(data);
    };

    fetchData();
  }, [range]);

  return (
    <div className={styles.card4}>
      <div className={styles.header}>
        <h2>Përmbledhja e Shitjeve</h2>
        <div className={styles.controls}>
          <select value={range} onChange={e => setRange(e.target.value)}>
            {rangeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={salesData}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4FADF7" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#4FADF7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip formatter={(value: number) => `${value}€`} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#4FADF7"
            strokeWidth={3}
            fill="url(#colorSales)"
            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
