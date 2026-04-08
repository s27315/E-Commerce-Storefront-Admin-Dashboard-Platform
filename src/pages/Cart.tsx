import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="page">
        <h1>My Cart</h1>
        <p className="empty">Your cart is empty. <Link to="/">Continue shopping</Link></p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>My Cart</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <img
                src={item.product.images?.[0] || 'https://placehold.co/80x80?text=N/A'}
                alt={item.product.title}
                className="cart-item-img"
              />
              <div className="cart-item-info">
                <h3>{item.product.title}</h3>
                <p>${Number(item.product.price).toFixed(2)}</p>
              </div>
              <div className="cart-item-qty">
                <button className="btn btn-secondary" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button className="btn btn-secondary" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
              </div>
              <p className="cart-item-subtotal">${(item.product.price * item.quantity).toFixed(2)}</p>
              <button className="btn btn-danger" onClick={() => removeItem(item.productId)}>Remove</button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
          <div className="summary-row"><span>Shipping</span><span>Free</span></div>
          <div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
          <Link to="/checkout" className="btn btn-primary btn-full">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
}
