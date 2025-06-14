'use client';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './../../src/app/dashboard/dashboard.module.css';

const COLORS = ['#e74c3c', '#27ae60', '#2980b9', '#f39c12', '#8e44ad'];

type ProductData = {
  name: string;
  value: number;
};

export default function TopProductsPie() {
  const [productData, setProductData] = useState<ProductData[]>([]);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const res = await fetch(`/api/dashboard/top-products`);
        const data = await res.json();
        setProductData(data);
      } catch (err) {
        console.error('Gabim gjatë marrjes së top produkteve:', err);
      }
    };

    fetchTopProducts();
  }, []);

  return (
    <div className={styles.card5}>
      <div className={styles.topProductsHeader}>Produktet Më të Shitura</div>
      <div className={styles.pieChartWrapper}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={productData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={false}
            >
              {productData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.legend}>
        {productData.map((entry, index) => (
          <div key={index} className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            {entry.name}
          </div>
        ))}
      </div>
    </div>
  );
}
