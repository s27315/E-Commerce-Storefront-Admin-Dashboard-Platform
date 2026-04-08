export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface ProductImage {
  url: string;
  format?: string;
  size?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  brand: string;
  images: ProductImage[];
  category: Category;
  categoryId?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  items: CartItem[];
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  shippingAddress: string;
  city: string;
  postalCode?: string;
  phoneNumber: string;
  fullName: string;
  createdAt: string;
  user?: User;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'CREDIT_CARD' | 'PAYPAL' | 'MOBILE_MONEY' | 'CASH_ON_DELIVERY';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  userRole: 'USER' | 'ADMIN' | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}
