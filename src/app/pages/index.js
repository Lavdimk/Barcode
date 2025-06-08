import React, { useState } from 'react';
import Header from '../../../components/Header/Header';

export default function Home() {
  const [page, setPage] = useState('sell'); 

  function handleNavClick(selectedPage) {
    setPage(selectedPage);
  }

  return (
    <>
      <Header onNavClick={handleNavClick} />

      <main style={{ padding: '20px' }}>

        {page === 'sell' && <h1>Sell / Barcode Scanner Page</h1>}
        {page === 'dashboard' && <h1>Welcome to Dashboard</h1>}
        {page === 'products' && <h1>Products List Page</h1>}
        {page === 'history' && <h1>History Page</h1>}
      </main>
    </>
  );
}
