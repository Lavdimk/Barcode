'use client';

import Link from 'next/link';
import styles from './Header.module.css';
import React, { useState } from 'react';
import AddProduct from '../AddProduct/Addproduct';
import { Plus } from 'lucide-react';
import NotificationDropdown from '../Notification/notificationModal';

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);


  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <>
      <nav className={styles.navbar}>

        <div className={styles.leftSide}>
          <h1 className={styles.title}>Barcode</h1>
          <div className={styles.links}>
            <Link href="/" className={styles.link}>Shitje</Link>
            <Link href="/dashboard" className={styles.link}>Ballina</Link>
            <Link href="/products" className={styles.link}>Produkte</Link>
            <Link href="/history" className={styles.link}>Historiku</Link>
          </div>
        </div>

        <div className={styles.rightSide}>
          <div className={styles.date}>{currentDate}</div>
          <NotificationDropdown />
          <button className={styles.addProductButton} onClick={openModal}>
            <Plus size={18} />
            <span>Shto Produkt</span>
          </button>
        </div>
      </nav>

      {isModalOpen && (
        <AddProduct
          onSuccess={() => {
            setIsModalOpen(false);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
