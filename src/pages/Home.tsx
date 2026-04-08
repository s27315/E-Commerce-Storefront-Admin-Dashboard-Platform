import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => api.get('/products').then((r) => r.data),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const filtered = products.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory ? p.category?.id === selectedCategory : true;
    return matchSearch && matchCat;
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Product Catalog</h1>
        <div className="filters">
          <input
            className="input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Loading products...</div>
      ) : filtered.length === 0 ? (
        <p className="empty">No products found.</p>
      ) : (
        <div className="product-grid">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
