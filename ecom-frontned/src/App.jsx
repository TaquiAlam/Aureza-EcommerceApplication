import { Routes, Route } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react"
import MainLayout from './components/templates/MainLayout';
import PrivateRoute from './components/templates/PrivateRoute';
import AdminLayout from './components/templates/AdminLayout';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotFoundPage from './pages/NotFoundPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProfilePage from './pages/ProfilePage';
import AddressesPage from './pages/AddressesPage';
import PaymentConfirmationPage from './pages/PaymentConfirmationPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminSellersPage from './pages/admin/AdminSellersPage';

export default function App() {
  return (
    <>
      <Routes>
        {/* Public Pages with Standard Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          {/* Protected Customer Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/addresses" element={<AddressesPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirm" element={<PaymentConfirmationPage />} />
          </Route>

          {/* Public-only Routes (Redirect if logged in) */}
          <Route element={<PrivateRoute publicPage />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>
          
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Protected Admin Routes with Admin Layout */}
        <Route element={<PrivateRoute adminOnly />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="sellers" element={<AdminSellersPage />} />
          </Route>
        </Route>
      </Routes>
      <Analytics />
    </>
  );
}
