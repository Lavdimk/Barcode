'use client';
import { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import styles from './../../src/app/dashboard/dashboard.module.css';

type Props = {
  period: string;
  setPeriod: (p: string) => void;
};

type DataPoint = {
  value: number;
};

export default function ProductSalesCard({ period, setPeriod }: Props) {
  const [data, setData] = useState<DataPoint[]>([{ value: 0 }]);
  const [totalQuantity, setTotalQuantity] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/dashboard/product-sales?period=${period}`);
        if (!res.ok) throw new Error('Failed to fetch sales data');
        const json = await res.json();

        setData(json.grouped.length ? json.grouped : [{ value: 0 }]);
        setTotalQuantity(json.totalQuantity || 0);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setData([{ value: 0 }]);
        setTotalQuantity(0);
      }
    }
    fetchData();
  }, [period]);

  return (
    <div className={`${styles.card} ${styles.card2}`}>
      <div className={styles.salesCard}>
        <div className={styles.cardHeader}>
          <h3>Produktet e Shitura</h3>
          <select
            className={styles.dropdown}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="Today">Sot</option>
            <option value="1 week">Java e fundit</option>
            <option value="1 month">Muaji i fundit</option>
            <option value="1 year">Viti i fundit</option>
          </select>
        </div>

        <div className={styles.productPrice}>{totalQuantity}</div>

        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={50}>
            <LineChart data={data}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#FFA500"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.productGrowth}>
          <span className={styles.productUpArrow}>↑</span> 10.4%
        </div>
      </div>
    </div>
  );
}
