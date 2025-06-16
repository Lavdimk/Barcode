'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import './sell.css'
import { Trash2, Pencil } from 'lucide-react'


type Product = {
  id: string
  name: string
  barcode: string
  price: number
  amount: number
  stockAmount?: number
}

const STORAGE_KEY = 'scannedProducts'

export default function SellPage() {
  const [barcode, setBarcode] = useState('')
  const [productList, setProductList] = useState<Product[]>([])
  const [showClearModal, setShowClearModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)
  const [editedAmount, setEditedAmount] = useState('')
  const [error, setError] = useState('')
  const [isProcessingSale, setIsProcessingSale] = useState(false)

  const pathname = usePathname()

  useEffect(() => {
    const loadProducts = () => {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setProductList(JSON.parse(saved))
      }
    }

    if (pathname === '/sell') {
      loadProducts()
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && pathname === '/sell') {
        loadProducts()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [pathname])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(productList))
  }, [productList])

  useEffect(() => {
    const isValid = barcode.length === 8 || barcode.length === 13
    if (isValid) {
      const timeout = setTimeout(() => {
        fetchProductByBarcode(barcode)
        setBarcode('')
      }, 150)
      return () => clearTimeout(timeout)
    }
  })

  async function fetchProductByBarcode(barcode: string) {
    try {
      setError('')
      const res = await fetch(`/api/products?barcode=${barcode}`)
      if (!res.ok) throw new Error('Produkti nuk u gjet.')
      const data: Product = await res.json()

      addProductToList({ ...data, stockAmount: data.amount })
    } catch (err) {
      setError((err as Error).message)
    }
  }

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement

      if (active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA') {
        return
      }

      if (e.key === 'Escape') {
        if (productToEdit) {
          setProductToEdit(null)
        } else if (productToDelete) {
          setProductToDelete(null)
        } else if (showClearModal) {
          setShowClearModal(false)
        } else if (showCompleteModal) {
          setShowCompleteModal(false)
        }
      }

      if (e.key === 'Enter') {
        e.preventDefault()

        if (productToEdit && editedAmount !== '' && Number(editedAmount) >= 1) {
          setProductList((prev) =>
            prev.map((p) =>
              p.barcode === productToEdit.barcode
                ? { ...p, amount: Number(editedAmount) }
                : p
            )
          )
          setProductToEdit(null)
          return
        }

        if (productToDelete) {
          setProductList((prev) =>
            prev.filter((p) => p.barcode !== productToDelete.barcode)
          )
          setProductToDelete(null)
          return
        }

        if (showClearModal) {
          clearList()
          setShowClearModal(false)
          return
        }

        if (showCompleteModal) {
          if (isProcessingSale) return
          setIsProcessingSale(true)
          await completeSale()
          setShowCompleteModal(false)
          setIsProcessingSale(false)
          return
        }

        if (!productToEdit && !productToDelete && !showClearModal && !showCompleteModal && productList.length > 0) {
          setShowCompleteModal(true)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  const addProductToList = (product: Product) => {
    setProductList((prev) => {
      const existing = prev.find((p) => p.barcode === product.barcode)
      if (existing) {
        return prev.map((p) =>
          p.barcode === product.barcode
            ? { ...p, amount: p.amount + 1, stockAmount: product.stockAmount }
            : p
        )
      } else {
        return [...prev, { ...product, amount: 1 }]
      }
    })
  }

  const clearList = () => {
    setProductList([])
    localStorage.removeItem(STORAGE_KEY)
    setError('')
  }

  const completeSale = async () => {
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: productList.map(p => ({
            id: p.id,
            amount: p.amount,
            price: p.price,
          })),
          totalPrice: Number(totalPrice.toFixed(2)),
        }),
      })

      if (!res.ok) throw new Error('Nuk u ruajt fatura.')
      clearList()
    } catch (err) {
      console.error(err)
      alert('Ndodhi një gabim gjatë ruajtjes së shitjes.')
    }
  }

  const totalPrice = productList.reduce((sum, p) => sum + p.amount * p.price, 0)

  return (
    <div className="sell-container">
      <div className="left-panel">
        <div className='header'>
          <input
            autoFocus
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Scan barcode..."
            className="sell-input"
          />

          {error && <p className="sell-error">{error}</p>}
        </div>

        <div className="product-list">
          <table className="product-table">
            <thead>
              <tr>
                <th>Sasia</th>
                <th>Emri</th>
                <th>Çmimi</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {productList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-message">
                    Nuk ka produkte të skanuara.
                  </td>
                </tr>
              ) : (
                productList.map((p, index) => {
                  const isOverstock = p.amount > (p.stockAmount ?? 0);

                  return (
                    <tr key={p.barcode + index} className={isOverstock ? 'row-overstock' : ''}>
                      <td><span className="rounded-cell">{p.amount}</span></td>
                      <td>{p.name}</td>
                      <td><span className="rounded-cell">{p.price.toFixed(2)} €</span></td>
                      <td className="total-cell">
                        {(p.amount * p.price).toFixed(2)} €
                        <span >
                          <button
                            onClick={() => {
                              setProductToEdit(p);
                              setEditedAmount(String(p.amount));

                            }}
                            className='editBtn'
                          >
                            <Pencil color="black" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(p)}
                            className="deleteBtn"

                          >
                            <Trash2 color="red" />

                          </button>
                        </span>
                      </td>
                    </tr>
                  );
                })

              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="right-panel">
        <span>{totalPrice.toFixed(2)}€</span>
        <hr />
        <div className="bottom-buttons">
          <button
            className="big-button clear-btn"
            onClick={() => setShowClearModal(true)}
            disabled={productList.length === 0}
          >
            Fshi
          </button>
          <button
            className="big-button complete-btn"
            onClick={() => setShowCompleteModal(true)}
            disabled={productList.length === 0}
          >
            Paguaj
          </button>
        </div>
      </div>

      {showClearModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>A je i sigurt që dëshiron të fshish të gjitha produktet e skanuara?</p>
            <div className="modal-buttons">
              <button className="confirm" onClick={() => {
                clearList()
                setShowClearModal(false)
              }}>Po</button>
              <button className="cancel" onClick={() => setShowClearModal(false)}>Jo</button>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>A je i sigurt që dëshiron të kryesh pagesën?</p>
            <div className="modal-buttons">
              <button
                className="confirm"
                disabled={isProcessingSale} // blloko klikimet gjatë përpunimit
                onClick={async () => {
                  if (isProcessingSale) return
                  setIsProcessingSale(true)
                  await completeSale()
                  setShowCompleteModal(false)
                  setIsProcessingSale(false)
                }}
              >
                {isProcessingSale ? 'Duke u ruajtur...' : 'Po'}
              </button>
              <button className="cancel" onClick={() => setShowCompleteModal(false)}>Jo</button>
            </div>
          </div>
        </div>
      )}

      {productToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>A je i sigurt që dëshiron të fshish <strong>{productToDelete.name}</strong>?</p>
            <div className="modal-buttons">
              <button className="confirm" onClick={() => {
                setProductList((prev) => prev.filter(p => p.barcode !== productToDelete.barcode))
                setProductToDelete(null)
              }}>Po</button>
              <button className="cancel" onClick={() => setProductToDelete(null)}>Jo</button>
            </div>
          </div>
        </div>
      )}

      {productToEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Ndrysho sasinë për <strong>{productToEdit.name}</strong>:</p>
            <input
              type="number"
              min={1}
              value={editedAmount}
              onChange={(e) => setEditedAmount(e.target.value)}
              className="edit-input"
            />
            {editedAmount === '' || Number(editedAmount) < 1 ? (
              <p className="edit-error">Sasia duhet të jetë së paku 1.</p>
            ) : null}
            <div className="modal-buttons">
              <button
                className="confirm"
                disabled={editedAmount === '' || Number(editedAmount) < 1}
                onClick={() => {
                  setProductList((prev) =>
                    prev.map((p) =>
                      p.barcode === productToEdit.barcode
                        ? { ...p, amount: Number(editedAmount) }
                        : p
                    )
                  )
                  setProductToEdit(null)
                }}
              >
                Ruaj
              </button>
              <button className="cancel" onClick={() => setProductToEdit(null)}>
                Mbyll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}