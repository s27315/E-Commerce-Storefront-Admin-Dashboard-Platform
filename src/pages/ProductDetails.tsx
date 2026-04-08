import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { isAuthenticated, userRole } = useAuth();
  const [qty, setQty] = useState(1);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => api.get(`/api/public/products/${id}`).then((r) => r.data?.data?.product ?? r.data?.data),
  });

  if (isLoading) return <div className="loading">Loading...</div>;
  if (!product) return <div className="page"><p>Product not found.</p></div>;

  const handleAdd = () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    addItem(product, qty);
    toast.success(`${product.title} added to cart`);
  };

  return (
    <div className="page product-details">
      <img
        src={product.images?.[0] || 'https://placehold.co/500x400?text=No+Image'}
        alt={product.title}
        className="detail-img"
      />
      <div className="detail-info">
        <h1>{product.title}</h1>
        <p className="product-brand">{product.brand}</p>
        <p className="product-price">${Number(product.price).toFixed(2)}</p>
        <p className="product-stock">
          {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
        </p>
        <p className="product-category">Category: {product.category?.name}</p>
        <p className="product-desc">{product.description}</p>

        {userRole !== 'ADMIN' && (
          <div className="qty-row">
            <input
              type="number"
              className="input qty-input"
              min={1}
              max={product.stock}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
            <button
              className="btn btn-primary"
              onClick={handleAdd}
              disabled={product.stock === 0}
            >
              Add to Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
