'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './addWeightedProduct.module.css';
import LoadingSpinner from '../loadingSpinner';

type Product = {
    id: string;
    name: string;
    barcode: string;
    price: number;
    amount: number;
};

export default function AddWeightedProductButton({
    onProductAdd,
}: {
    onProductAdd: (product: Product, quantity: number) => void;
}) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [weightedProducts, setWeightedProducts] = useState<Product[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantityInput, setQuantityInput] = useState('');
    const [inputError, setInputError] = useState('');
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const handleDropdownToggle = () => {
        setShowDropdown((prev) => {
            const next = !prev;
            if (next && weightedProducts.length === 0) {
                setLoadingProducts(true);
                fetch('/api/products?isWeight=true')
                    .then((res) => res.json())
                    .then((data) => setWeightedProducts(data.products || []))
                    .catch((err) => console.error('Gabim gjatë fetch:', err))
                    .finally(() => setLoadingProducts(false));
            }
            return next;
        });
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddClick = (product: Product) => {
        setSelectedProduct(product);
        setQuantityInput('');
        setInputError('');
        setShowModal(true);
    };

    const handleConfirmAdd = () => {
        const quantity = parseFloat(quantityInput);
        if (isNaN(quantity) || quantity <= 0) {
            setInputError('Sasia duhet të jetë më e madhe se 0.');
            return;
        }
        const roundedQuantity = parseFloat(quantity.toFixed(2));
        if (selectedProduct) {
            onProductAdd(selectedProduct, roundedQuantity);
        }
        setShowModal(false);
    };

    return (
        <div className={styles.wrapper} ref={dropdownRef}>
            <button className={styles.addButton} onClick={handleDropdownToggle}>
                + Shto produkte me peshë
            </button>

            {showDropdown && (
                <div className={styles.dropdown}>
                    {loadingProducts ? (
                        <div className={styles.spinnerContainer}>
                            <LoadingSpinner height={6} width={2} />
                        </div>
                    ) : weightedProducts.length === 0 ? (
                        <p className={styles.empty}>Asnjë produkt me peshë</p>
                    ) : (
                        weightedProducts.map((p) => (
                            <div
                                key={p.id}
                                className={styles.dropdownItem}
                                onClick={() => handleAddClick(p)}
                            >
                                {p.name} – €{p.price.toFixed(2)}/kg
                            </div>
                        ))
                    )}
                </div>
            )}


            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.name}>{selectedProduct?.name}</h3>
                        <input
                            type="number"
                            placeholder="Shkruaj sasinë në kg"
                            value={quantityInput}
                            onChange={(e) => {
                                setQuantityInput(e.target.value);
                                setInputError('');
                            }}
                            className={styles.modalInput}
                            step="0.01"
                            min="0.01"
                        />
                        {inputError && <p className={styles.inputError}>{inputError}</p>}
                        <div className={styles.modalButtons}>
                            <button className={styles.confirmBtn} onClick={handleConfirmAdd}>Shto</button>
                            <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Anulo</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
