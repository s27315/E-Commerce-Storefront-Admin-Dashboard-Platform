import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { isAuthenticated, userRole, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setOpen(false);
  };

  const close = () => setOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={close}>
        🛒 ShopZone
      </Link>

      <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
        <span /><span /><span />
      </button>

      <ul className={`nav-links${open ? ' open' : ''}`}>
        <li><Link to="/" onClick={close}>Home</Link></li>

        {userRole === 'ADMIN' && (
          <li><Link to="/admin" onClick={close}>Admin Dashboard</Link></li>
        )}

        {isAuthenticated && userRole !== 'ADMIN' && (
          <>
            <li>
              <Link to="/cart" onClick={close}>
                My Cart {count > 0 && <span className="badge">{count}</span>}
              </Link>
            </li>
            <li><Link to="/profile" onClick={close}>Profile</Link></li>
          </>
        )}

        {!isAuthenticated && (
          <li><Link to="/login" onClick={close}>Login</Link></li>
        )}

        {isAuthenticated && (
          <li>
            <button onClick={handleLogout} className="btn-link">Logout</button>
          </li>
        )}
      </ul>
    </nav>
  );
}
