import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Order } from '../types';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/api/auth/orders').then((r) => r.data?.data ?? []),
  });

  return (
    <div className="page">
      <h1>My Profile</h1>
      <div className="profile-info">
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
      </div>

      <h2>Order History</h2>
      {isLoading ? (
        <div className="loading">Loading orders...</div>
      ) : orders.length === 0 ? (
        <p className="empty">No orders yet.</p>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id.slice(0, 8)}...</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>${Number(o.totalAmount).toFixed(2)}</td>
                  <td><span className={`badge-status ${o.status.toLowerCase()}`}>{o.status}</span></td>
                  <td>{o.paymentMethod?.replace(/_/g, ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
