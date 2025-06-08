// components/DeleteModal.tsx
"use client";

import React from "react";
import { Product } from "@/generated/prisma";

export default function DeleteModal({
  product,
  onConfirm,
  onCancel,
}: {
  product: Product | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!product) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>
          Are you sure you want to delete <strong>{product.name}</strong>?
        </p>
        <div className="modal-buttons">
          <button className="confirm" onClick={onConfirm}>
            Po
          </button>
          <button className="cancel" onClick={onCancel}>
            Jo
          </button>
        </div>
      </div>
    </div>
  );
}
