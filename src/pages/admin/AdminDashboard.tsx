import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import type { Product, Order, OrderStatus, Category } from '../../types';
import ConfirmModal from '../../components/ConfirmModal';
import toast from 'react-hot-toast';

type Tab = 'products' | 'orders' | 'categories';

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('products');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: products = [], isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => api.get('/api/public/products').then((r) => r.data?.data?.all ?? []),
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery<Order[]>({
    queryKey: ['all-orders'],
    queryFn: () => api.get('/api/auth/orders/admin/all').then((r) => r.data?.data ?? []),
  });

  const { data: categories = [], isLoading: loadingCats } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/categories').then((r) => r.data?.data ?? r.data ?? []),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted');
      setDeleteId(null);
    },
    onError: () => toast.error('Delete failed'),
  });

  const updateOrderStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api.patch(`/api/auth/orders/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['all-orders'] });
      toast.success('Order status updated');
    },
    onError: () => toast.error('Update failed'),
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => api.delete(`/api/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted');
      setDeleteCatId(null);
    },
    onError: () => toast.error('Delete failed'),
  });

  return (
    <div className="page">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-actions">
          <Link to="/admin/product/new" className="btn btn-primary">+ Add Product</Link>
          <Link to="/admin/category/new" className="btn btn-secondary">+ Add Category</Link>
        </div>
      </div>

      <div className="tabs">
        {(['products', 'orders', 'categories'] as Tab[]).map((t) => (
          <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <div className="table-wrapper">
          {loadingProducts ? <div className="loading">Loading...</div> : (
            <table className="table">
              <thead>
                <tr><th>Title</th><th>Brand</th><th>Price</th><th>Stock</th><th>Category</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td>{p.brand}</td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>{p.stock}</td>
                    <td>{p.category?.name}</td>
                    <td className="action-cell">
                      <Link to={`/admin/product/${p.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'orders' && (
        <div className="table-wrapper">
          {loadingOrders ? <div className="loading">Loading...</div> : (
            <table className="table">
              <thead>
                <tr><th>ID</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th></tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id.slice(0, 8)}...</td>
                    <td>{o.fullName}</td>
                    <td>${Number(o.totalAmount).toFixed(2)}</td>
                    <td>{o.paymentMethod?.replace(/_/g, ' ')}</td>
                    <td>
                      <select
                        className="input input-sm"
                        value={o.status}
                        onChange={(e) => updateOrderStatus.mutate({ id: o.id, status: e.target.value as OrderStatus })}
                      >
                        {(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'categories' && (
        <div className="table-wrapper">
          {loadingCats ? <div className="loading">Loading...</div> : (
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Description</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.description || '—'}</td>
                    <td className="action-cell">
                      <Link to={`/admin/category/${c.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteCatId(c.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          message="Are you sure you want to delete this product?"
          onConfirm={() => deleteProduct.mutate(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {deleteCatId && (
        <ConfirmModal
          message="Are you sure you want to delete this category?"
          onConfirm={() => deleteCategory.mutate(deleteCatId)}
          onCancel={() => setDeleteCatId(null)}
        />
      )}
    </div>
  );
}
