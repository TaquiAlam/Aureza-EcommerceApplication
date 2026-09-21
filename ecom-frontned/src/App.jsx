import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivateRoute from './components/layout/PrivateRoute';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProfilePage from './pages/ProfilePage';
import AddressesPage from './pages/AddressesPage';
import PaymentConfirmationPage from './pages/PaymentConfirmationPage';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminSellersPage from './pages/AdminSellersPage';

export default function App() {
  return (
    <Routes>
      {/* Public Pages with Standard Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
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
  );
}
