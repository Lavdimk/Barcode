'use client';

import { Product } from '@prisma/client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import './products.css';
import LoadingSpinner from '../../../components/loadingSpinner';
import SearchInput from '../../../components/SearchInput/searchInput';
import { useNotificationStore } from '@/store/notificationStore';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTrigger, setSearchTrigger] = useState('');
  const [filterRed, setFilterRed] = useState(false);
  const [filterOrange, setFilterOrange] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadingRef = useRef(loading);
  const hasMoreRef = useRef(hasMore);
  const pageRef = useRef(page);
  const totalPagesRef = useRef(totalPages);

  useEffect(() => { loadingRef.current = loading }, [loading]);
  useEffect(() => { hasMoreRef.current = hasMore }, [hasMore]);
  useEffect(() => { pageRef.current = page }, [page]);
  useEffect(() => { totalPagesRef.current = totalPages }, [totalPages]);

  const fetchProducts = useCallback(
    async (
      pageNum: number,
      search: string,
      filterRedChecked: boolean,
      filterOrangeChecked: boolean
    ) => {
      setLoading(true);
      try {
        const limit = 50;
        const params = new URLSearchParams();
        params.append('page', pageNum.toString());
        params.append('limit', limit.toString());
        if (search) params.append('search', search);
        if (filterRedChecked) params.append('amount', '0');
        if (filterOrangeChecked) params.append('amountRange', '1-5');

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();

        if (pageNum === 1) {
          setProducts(data.products);
        } else {
          setProducts(prev => [...prev, ...data.products]);
        }

        const total = Math.ceil(data.total / limit);
        setTotalPages(total);
        setHasMore(pageNum < total);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    setPage(1);
    fetchProducts(1, searchTrigger, filterRed, filterOrange);
  }, [searchTrigger, filterRed, filterOrange, fetchProducts]);

  useEffect(() => {
    if (page === 1) return;
    fetchProducts(page, searchTrigger, filterRed, filterOrange);
  }, [page, searchTrigger, filterRed, filterOrange, fetchProducts]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 50 &&
      !loadingRef.current &&
      hasMoreRef.current &&
      pageRef.current < totalPagesRef.current
    ) {
      setPage((prev) => prev + 1);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleEditClick = (product: Product) => setEditingProduct(product);

  const handleEditSave = async (updatedProduct: Product) => {
    try {
      await fetch(`/api/products?id=${updatedProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedProduct),
        headers: { 'Content-Type': 'application/json' },
      });
      const refetchNotifications = useNotificationStore.getState().refetch;
      refetchNotifications();
      setEditingProduct(null);
      setPage(1);
      setProducts([]);
      fetchProducts(1, searchTrigger, filterRed, filterOrange);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteClick = (product: Product) => setProductToDelete(product);

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await fetch(`/api/products?id=${productToDelete.id}`, {
        method: 'DELETE',
      });
      setProductToDelete(null);
      setPage(1);
      setProducts([]);
      fetchProducts(1, searchTrigger, filterRed, filterOrange);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setProducts([]);
      setPage(1);
      setSearchTrigger(searchQuery);
    }
  };

  if (loading && page === 1) return <LoadingSpinner />;

  return (
    <div>
      <div className="products-header">
        <h1 className="products-title">Lista Produkteve</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{
            backgroundColor: filterRed ? 'rgba(255, 0, 0, 0.15)' : '#e0e0e0',
            padding: '6px 10px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <input
              type="checkbox"
              checked={filterRed}
              onChange={() => setFilterRed(!filterRed)}
            />
            0 stok
          </label>

          <label style={{
            backgroundColor: filterOrange ? 'rgba(255, 165, 0, 0.15)' : '#e0e0e0',
            padding: '6px 10px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <input
              type="checkbox"
              checked={filterOrange}
              onChange={() => setFilterOrange(!filterOrange)}
            />
            1–5 stok
          </label>

          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchEnter}
            placeholder="Kërko Produkte..."
          />
        </div>
      </div>

      <table cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Emri</th>
            <th>Barcode</th>
            <th>Stoku</th>
            <th>Çmimi</th>
            <th>Veprimet</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr
              key={p.id}
              className={
                p.amount === 0
                  ? 'row-red'
                  : p.amount > 0 && p.amount <= 5
                    ? 'row-orange'
                    : ''
              }
            >
              <td>{p.id}</td>
              <td className="product-cell">{p.name}</td>
              <td>{p.barcode}</td>
              <td>{p.amount}</td>
              <td className="product-cell">${p.price}</td>
              <td className="actions">
                <button className="edit" onClick={() => handleEditClick(p)}>Ndrysho</button>
                <button className="delete" onClick={() => handleDeleteClick(p)}>Fshi</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && page > 1 && <LoadingSpinner />}

      {productToDelete && (
        <ConfirmModal
          title="Fshij Produktin"
          message={`A jeni i sigurt që dëshironi të fshini "${productToDelete.name}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setProductToDelete(null)}
        />
      )}

      {editingProduct && (
        <EditProductForm
          product={editingProduct}
          onSave={handleEditSave}
          onCancel={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}

function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-buttons">
          <button className="confirm" onClick={onConfirm}>Po</button>
          <button className="cancel" onClick={onCancel}>Jo</button>
        </div>
      </div>
    </div>
  );
}

function EditProductForm({
  product,
  onSave,
  onCancel,
}: {
  product: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(product.name);
  const [barcode, setBarcode] = useState(product.barcode);
  const [amount, setAmount] = useState(product.amount);
  const [price, setPrice] = useState(product.price);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...product, name, barcode, amount, price });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content edit-modal">
        <h2>Përditëso Produktin</h2>
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label>Emri:</label>
            <input
              ref={nameInputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label>Barcode:</label>
            <input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label>Sasia:</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              min={0}
            />
          </div>
          <div className="form-group">
            <label>Çmimi:</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
              min={0}
            />
          </div>
          <div className="modalButtonsEdit">
            <button type="submit" className="submitButton">Ruaj</button>
            <button type="button" className="cancelButton" onClick={onCancel}>Anulo</button>
          </div>
        </form>
      </div>
    </div>
  );
}
