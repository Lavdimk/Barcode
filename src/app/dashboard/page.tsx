'use client';
import styles from './dashboard.module.css';
import { useEffect, useState } from 'react';
import TodaySaleCard from '../../../components/Dashboard/TodaySaleCard';
import ProductSalesCard from '../../../components/Dashboard/ProductSalesCard';
import AllProductsCard from '../../../components/Dashboard/AllProductsCard';
import SalesOverview from '../../../components/Dashboard/SalesOverview';
import TopProductsPie from '../../../components/Dashboard/TopProductsPie';

export type Invoice = {
  totalPrice: number;
  createdAt: string;
};

export default function Dashboard() {
  const [todayTotal, setTodayTotal] = useState<number | null>(null);
  const [todayInvoices, setTodayInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const fetchTodayTotal = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invoices`);
        if (!res.ok) throw new Error('Gabim gjatë marrjes së faturave');
        const data: Invoice[] = await res.json();

        const today = new Date().toDateString();
        const todayOnly = data.filter(inv => new Date(inv.createdAt).toDateString() === today);

        const total = todayOnly.reduce((sum, inv) => sum + inv.totalPrice, 0);

        setTodayTotal(total);
        setTodayInvoices(todayOnly);
      } catch (err) {
        console.error('Gabim:', err);
      }
    };

    fetchTodayTotal();
  }, []);

  const [period, setPeriod] = useState<string>('Today');

  return (
    <div className={styles.wrapper}>
      <div className={styles.topGrid}>
        <TodaySaleCard todayTotal={todayTotal} invoices={todayInvoices} />
        <ProductSalesCard period={period} setPeriod={setPeriod} />
        <AllProductsCard />
      </div>
      <div className={styles.bottomGrid}>
        <SalesOverview />
        <TopProductsPie />
      </div>
    </div>
  );
}
