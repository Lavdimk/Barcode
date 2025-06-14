"use client";

import { Product } from "@prisma/client";
import React, { useEffect, useState } from "react";
import "./products.css";
import LoadingSpinner from "../../../components/loadingSpinner";
import SearchInput from "../../../components/SearchInput/searchInput";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRed, setFilterRed] = useState(false);
  const [filterOrange, setFilterOrange] = useState(false);


  const fetchProducts = async () => {
    const res = await fetch(`api/products`);
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
  };

  const handleEditSave = async (updatedProduct: Product) => {
    await fetch(`/api/products?id=${updatedProduct.id}`, {
      method: "PUT",
      body: JSON.stringify(updatedProduct),
      headers: { "Content-Type": "application/json" },
    });
    setEditingProduct(null);
    fetchProducts();
  };

  const handleEditCancel = () => {
    setEditingProduct(null);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    await fetch(`/api/products?id=${productToDelete.id}`, { method: "DELETE" });
    setShowDeleteModal(false);
    setProductToDelete(null);
    fetchProducts();
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const filteredProducts = products.filter((product) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(q) ||
      product.barcode.toLowerCase().includes(q) ||
      product.amount.toString().includes(q) ||
      product.price.toString().includes(q);

    const matchesRed = filterRed && product.amount === 0;
    const matchesOrange = filterOrange && product.amount > 0 && product.amount <= 5;
    const showBasedOnCheckboxes = filterRed || filterOrange
      ? matchesRed || matchesOrange
      : true;

    return matchesSearch && showBasedOnCheckboxes;
  });


  if (loading) {
    return (
      <LoadingSpinner />
    )
  }

  return (
    <div>
      <div className="products-header">
        <h1 className="products-title">Lista Produkteve</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: filterRed ? "rgba(255, 0, 0, 0.15)" : "#e0e0e0",
              padding: "6px 10px",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background-color 0.2s ease"
            }}
          >
            <input
              type="checkbox"
              checked={filterRed}
              onChange={() => setFilterRed(!filterRed)}
            />
            0 stok
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: filterOrange ? "rgba(255, 165, 0, 0.15)" : "#e0e0e0",
              padding: "6px 10px",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background-color 0.2s ease"
            }}
          >
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
            <th>Cmimi</th>
            <th>Veprimet</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((p) => (
            <tr
              key={p.id}
              className={
                p.amount === 0
                  ? "row-red"
                  : p.amount > 0 && p.amount <= 5
                    ? "row-orange"
                    : ""
              }
            >
              <td >{p.id}</td>
              <td className="product-cell">{p.name}</td>
              <td >{p.barcode}</td>
              <td >{p.amount}</td>
              <td className="product-cell">${p.price}</td>
              <td className="actions">
                <button className="edit" onClick={() => handleEditClick(p)}>
                  Ndrysho
                </button>
                <button className="delete" onClick={() => handleDeleteClick(p)}>
                  Fshi
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>
              A jeni i sigurt që dëshironi të fshini{" "}
              <strong>{productToDelete?.name}</strong>?
            </p>
            <div className="modal-buttons">
              <button className="confirm" onClick={confirmDelete}>
                Po
              </button>
              <button className="cancel" onClick={cancelDelete}>
                Jo
              </button>
            </div>
          </div>
        </div>
      )}

      {editingProduct && (
        <EditProductForm
          product={editingProduct}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
        />
      )}
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

  const nameInputRef = React.useRef<HTMLInputElement>(null);

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
        <h2>Perditëso Produktin</h2>
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
            <label>Price:</label>
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
            <button type="submit" className="submitButton">
              Ruaj
            </button>
            <button type="button" className="cancelButton" onClick={onCancel}>
              Anulo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}