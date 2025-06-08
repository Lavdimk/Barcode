// components/ProductRow.tsx
"use client";

import React from "react";
import { Product } from "@/generated/prisma";

export default function ProductRow({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}) {
  const rowClass =
    product.amount === 0
      ? "row-red"
      : product.amount > 0 && product.amount <= 5
      ? "row-orange"
      : "";

  return (
    <tr className={rowClass}>
      <td>{product.id}</td>
      <td className="product-cell">{product.name}</td>
      <td>{product.barcode}</td>
      <td>{product.amount}</td>
      <td className="product-cell">${product.price}</td>
      <td className="actions">
        <button className="edit" onClick={() => onEdit(product)}>
          Edit
        </button>
        <button className="delete" onClick={() => onDelete(product)}>
          Delete
        </button>
      </td>
    </tr>
  );
}
