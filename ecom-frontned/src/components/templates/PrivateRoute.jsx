import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Loader } from 'lucide-react';

export default function PrivateRoute({ publicPage = false, adminOnly = false }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const isSeller = user?.roles?.includes('ROLE_SELLER');

  if (publicPage) {
    return user ? <Navigate to="/" replace /> : <Outlet />;
  }

  if (adminOnly) {
    if (isSeller && !isAdmin) {
      const sellerAllowedPaths = ['/admin/orders', '/admin/products'];
      const sellerAllowed = sellerAllowedPaths.some((path) =>
        location.pathname.startsWith(path)
      );
      if (!sellerAllowed) {
        return <Navigate to="/" replace />;
      }
    } else if (!isAdmin && !isSeller) {
      // Normal user trying to access admin page
      return <Navigate to="/" replace />;
    }
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
