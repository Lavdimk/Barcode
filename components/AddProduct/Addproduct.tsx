'use client'
import { useState } from 'react'
import styles from './AddProduct.module.css'

export default function AddProduct({ onSuccess, onCancel }: {
  onSuccess?: () => void; onCancel?: () => void;
}) {
  const [form, setForm] = useState({
    barcode: '',
    name: '',
    amount: '',
    price: '',
  })
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        barcode: form.barcode,
        name: form.name,
        amount: parseInt(form.amount),
        price: parseFloat(form.price),
      }),
    })

    if (res.ok) {
      setMessage('Produkti u shtua me sukses!')
      setForm({ barcode: '', name: '', amount: '', price: '' })
      if (onSuccess) onSuccess()
    } else {
      setMessage('Gabim gjatë shtimit të produktit.')
    }
  }

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
            <label>Sasia:</label>
            <input
              value={form.amount}
              type="number"
              placeholder="Sasia e Produktit"

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
              placeholder="Cmimi i Produktit"

              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              autoComplete="off"
            />
          </div>

          <div className={styles.modalButtons}>
            <button type="submit" className={styles.submitButton}>
              Shto
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => {
                if (onCancel) {
                  try {
                    onCancel();
                  } catch (err) {
                    console.error('Gabim gjatë onCancel:', err);
                  }
                }
              }}

            >
              Anulo
            </button>
          </div>
        </form>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  )
}
