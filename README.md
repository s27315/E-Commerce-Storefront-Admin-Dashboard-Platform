# E-Commerce Storefront & Admin Dashboard Platform

A production-grade E-Commerce platform built with React, TypeScript, Vite, TanStack Query, React Hook Form, Zod, and Axios. Features a customer-facing storefront and a secure admin dashboard with full role-based access control (RBAC).

## 🚀 Live Demo

> Deployed on Vercel — [Add your live URL here]

## 🔐 Admin Login Credentials (for grading)

| Field    | Value           |
|----------|-----------------|
| Email    | admin@admin.com |
| Password | admin123        |

## ✨ Features

- **Role-Based Auth**: Admin vs User roles with protected routes
- **Product Catalog**: Browse, search, and filter products by category
- **Shopping Cart**: Persistent cart with localStorage, quantity controls
- **Multi-Step Checkout**: Shipping → Payment → Review with strict validation
- **Admin Dashboard**: Manage products, orders, and categories
- **TanStack Query**: Caching for products, categories, and orders
- **Responsive Design**: Mobile-first, hamburger menu on small screens
- **Toast Notifications**: Success/error feedback throughout

## 🛠 Tech Stack

- React 19 + TypeScript
- Vite
- React Router DOM v7
- TanStack Query v5
- React Hook Form + Zod
- Axios 1.14.0 (safe version)
- React Hot Toast

## 📦 Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/s27315/E-Commerce-Storefront-Admin-Dashboard-Platform.git
cd E-Commerce-Storefront-Admin-Dashboard-Platform

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🔗 API

Backend API: `https://e-commas-apis-production.up.railway.app`  
API Docs: [Swagger UI](https://e-commas-apis-production.up.railway.app/api-docs/)

## 📁 Project Structure

```
src/
├── context/        # AuthContext, CartContext
├── components/     # Navbar, ProductCard, ProtectedRoute, ConfirmModal
├── pages/          # Home, Login, ProductDetails, Cart, Checkout, Profile
│   └── admin/      # AdminDashboard, ProductForm, CategoryForm
├── lib/            # Axios instance (api.ts)
└── types/          # TypeScript interfaces
```

## 🔒 Role-Based Access

| Route                  | Access        |
|------------------------|---------------|
| `/`                    | Public        |
| `/products/:id`        | Public        |
| `/login`               | Public        |
| `/cart`                | User only     |
| `/checkout`            | User only     |
| `/profile`             | User only     |
| `/admin`               | Admin only    |
| `/admin/product/new`   | Admin only    |
| `/admin/product/:id/edit` | Admin only |
| `/admin/category/new`  | Admin only    |
| `/admin/category/:id/edit` | Admin only |
