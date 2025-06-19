'use client';

import { useState } from 'react';
import styles from './AddProduct.module.css';

export default function AddProduct({ onSuccess, onCancel }: {
  onSuccess?: () => void; onCancel?: () => void;
}) {
  const [form, setForm] = useState({
    barcode: '',
    name: '',
    amount: '',
    price: '',
    isWeight: false,
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        barcode: form.barcode,
        name: form.name,
        amount: parseFloat(form.amount),
        price: parseFloat(form.price),
        isWeight: form.isWeight,
      }),
    });

    if (res.ok) {
      setMessage('Produkti u shtua me sukses!');
      setForm({ barcode: '', name: '', amount: '', price: '', isWeight: false });
      if (onSuccess) onSuccess();
    } else {
      setMessage('Gabim gjatë shtimit të produktit.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content edit-modal">
        <h2>Shto Produkt</h2>
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label>Emri:</label>
            <input
              value={form.name}
              type="text"
              placeholder="Emri i Produktit"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label>Barcode:</label>
            <input
              value={form.barcode}
              type="text"
              placeholder="Barcode i Produktit"
              onChange={(e) => setForm({ ...form, barcode: e.target.value })}
              required
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label>{form.isWeight ? 'Pesha (kg):' : 'Sasia:'}</label>
            <input
              value={form.amount}
              type="number"
              step={form.isWeight ? "0.01" : "1"}
              min={form.isWeight ? "0.01" : "1"}
              placeholder={form.isWeight ? 'P.sh. 1.5 (kg)' : 'Sasia e Produktit'}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label>Cmimi:</label>
            <input
              value={form.price}
              type="number"
              step="0.01"
              min={"0.01"}
              placeholder="Cmimi i Produktit"
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={form.isWeight}
                onChange={(e) => setForm({ ...form, isWeight: e.target.checked })}
              /> Produkt me peshë (kg)
            </label>
          </div>

          <div className={styles.modalButtons}>
            <button type="submit" className={styles.submitButton}>Shto</button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => onCancel?.()}
            >
              Anulo
            </button>
          </div>
        </form>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
}