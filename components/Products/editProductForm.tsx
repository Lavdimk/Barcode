// components/EditProductForm.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Product } from "@/generated/prisma";

export default function EditProductForm({
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
        <h2>Edit Product</h2>
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label>Name:</label>
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
            <label>Amount:</label>
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
              Save
            </button>
            <button type="button" className="cancelButton" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
