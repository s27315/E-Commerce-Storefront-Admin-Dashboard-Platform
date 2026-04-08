import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { isAuthenticated, userRole } = useAuth();

  const handleAdd = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    addItem(product);
    toast.success(`${product.title} added to cart`);
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`}>
        <img
          src={product.images?.[0] || 'https://placehold.co/300x200?text=No+Image'}
          alt={product.title}
          className="product-img"
        />
        <div className="product-info">
          <h3 className="product-title">{product.title}</h3>
          <p className="product-brand">{product.brand}</p>
          <p className="product-price">${Number(product.price).toFixed(2)}</p>
          <p className="product-stock">
            {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
          </p>
        </div>
      </Link>
      {userRole !== 'ADMIN' && (
        <button
          className="btn btn-primary"
          onClick={handleAdd}
          disabled={product.stock === 0}
        >
          Add to Cart
        </button>
      )}
    </div>
  );
}
