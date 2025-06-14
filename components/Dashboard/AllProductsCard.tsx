'use client';
import { useEffect, useState } from 'react';
import styles from './../../src/app/dashboard/dashboard.module.css';
import Image from 'next/image';


export default function AllProductsCard() {
  const [countType, setCountType] = useState<'unike' | 'gjithsej'>('unike');
  const [uniqueCount, setUniqueCount] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [addedThisWeek, setAddedThisWeek] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/product-count`);
        if (!res.ok) {
          console.error('Response error:', res.status, res.statusText);
          return;
        }
        const data = await res.json();

        if (!data || typeof data.uniqueCount !== 'number' || typeof data.totalStock !== 'number') {
          console.error('Invalid data format from API:', data);
          return;
        }

        setUniqueCount(data.uniqueCount);
        setTotalStock(data.totalStock);
        setAddedThisWeek(data.addedThisWeek);
      } catch (err) {
        console.error('Gabim gjatë marrjes së të dhënave:', err);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div className={`${styles.card} ${styles.card3}`}>
      <div className={styles.allProductsContainer}>
        <div className={styles.allProductsHeader}>
          <h3 className={styles.allProductsTitle}>Të Gjitha Produktet</h3>
          <div className={styles.switchWrapper}>
            <button
              className={`${styles.switchButton} ${countType === 'unike' ? styles.activeSwitch : ''}`}
              onClick={() => setCountType('unike')}
            >
              Unike
            </button>
            <button
              className={`${styles.switchButton} ${countType === 'gjithsej' ? styles.activeSwitch : ''}`}
              onClick={() => setCountType('gjithsej')}
            >
              Gjithsej
            </button>
          </div>
          <div className={styles.allProductsGrowth}>
            <span className={styles.allProductsArrow}>↑</span> +{addedThisWeek} produkt{addedThisWeek === 1 ? '' : 'e'} këtë javë
          </div>
        </div>

        <Image
          src="/images/package.png"
          alt="Package"
          width={100}
          height={100}
          className={styles.allProductsImage}
        />
        <div className={styles.allProductsCount}>
          {countType === 'unike' ? uniqueCount : totalStock}
        </div>
      </div>
    </div>
  );
}
