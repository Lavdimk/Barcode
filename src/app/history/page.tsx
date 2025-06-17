'use client'

import React, { useEffect, useState } from 'react'
import styles from './historyPage.module.css'
import LoadingSpinner from '../../../components/loadingSpinner'
import SearchInput from '../../../components/SearchInput/searchInput'
import { Trash2 } from 'lucide-react'

type Invoice = {
  id: number
  totalPrice: number
  createdAt: string
  items: {
    amount: number
    price: number
    product: {
      name: string
    }
  }[]
}

export default function HistoryPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [modalContent, setModalContent] = useState<{
    type: 'single' | 'date',
    id?: number,
    date?: string
  } | null>(null)

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/invoices')
      if (!res.ok) {
        alert('Gabim gjatë marrjes së faturave')
        setLoading(false)
        return
      }
      const data = await res.json()
      setInvoices(data)
    } catch {
      alert('Gabim gjatë marrjes së faturave')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const groupedByDate = invoices.reduce((acc, invoice) => {
    const date = new Date(invoice.createdAt).toLocaleDateString('sq-AL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    acc[date] = acc[date] || []
    acc[date].push(invoice)
    return acc
  }, {} as Record<string, Invoice[]>)

  const toggleExpand = (date: string) => {
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }))
  }

  const requestDeleteInvoicesByDate = (date: string) => {
    setModalContent({ type: 'date', date })
    setShowDeleteModal(true)
  }

  const requestDeleteInvoiceById = (id: number) => {
    setModalContent({ type: 'single', id })
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!modalContent) return

    try {
      const url = modalContent.type === 'date'
        ? `/api/invoices?date=${encodeURIComponent(modalContent.date!)}`
        : `/api/invoices?id=${modalContent.id}`

      const res = await fetch(url, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchInvoices()
      } else {
        alert('Gabim gjatë fshirjes së faturës.')
      }
    } catch {
      alert('Gabim gjatë fshirjes së faturës.')
    } finally {
      setShowDeleteModal(false)
      setModalContent(null)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className={styles.historyContainer}>
      <div className="products-header">
        <h1 className="products-title">Historiku</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Kërko sipas datës..."
          />
        </div>
      </div>

      {Object.entries(groupedByDate)
        .filter(([date]) =>
          date.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(([date, invoices]) => {
          const dailyTotal = invoices.reduce((sum, inv) => sum + inv.totalPrice, 0)

          return (
            <div key={date} className={styles.dateGroup}>
              <div className={styles.dateHeader} onClick={() => toggleExpand(date)}>
                <span>{date}</span>
                <span className={styles.dateSummary}>
                  {invoices.length} fatura -{' '}
                  <span className={styles.totalAmountGreen}>
                    Total: {dailyTotal.toFixed(2)} €
                  </span>
                </span>

                <button
                  className={styles.deleteDayBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    requestDeleteInvoicesByDate(date)
                  }}
                >
                  <Trash2 color="red" size={18} />
                </button>
              </div>

              {expandedDates[date] &&
                invoices.slice().reverse().map((invoice, index) => (
                  <div key={invoice.id} className={styles.invoiceBox}>
                    <div className={styles.invoiceHeader}>
                      <p className={styles.invoiceTotal}>
                        <span className={styles.invoiceNumber}>Fatura {index + 1}</span> - Totali:
                        <span className={styles.totalAmountGreen}> {invoice.totalPrice.toFixed(2)} €</span>
                      </p>
                      <button
                        className={styles.deleteInvoiceBtn}
                        onClick={() => requestDeleteInvoiceById(invoice.id)}
                      >
                        <Trash2 color="red" size={16} />
                      </button>
                    </div>
                    <ul className={styles.itemList}>
                      <table className={styles.invoiceTable}>
                        <thead>
                          <tr>
                            <th>Produkti</th>
                            <th>Sasia</th>
                            <th>Çmimi</th>
                            <th>Totali</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoice.items.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.product.name}</td>
                              <td>{item.amount}</td>
                              <td>{item.price.toFixed(2)} €</td>
                              <td>{(item.price * item.amount).toFixed(2)} €</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </ul>
                  </div>
                ))}
            </div>
          )
        })}

      {showDeleteModal && modalContent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>
              A je i sigurt që dëshiron të fshish{' '}
              <strong>
                {modalContent.type === 'single'
                  ? 'këtë faturë?'
                  : `të gjitha faturat për datën ${modalContent.date}?`}
              </strong>
            </p>
            <div className="modal-buttons">
              <button className="confirm" onClick={confirmDelete}>Po</button>
              <button className="cancel" onClick={() => setShowDeleteModal(false)}>Jo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
