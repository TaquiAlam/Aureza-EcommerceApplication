import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Loader } from 'lucide-react';

export default function PrivateRoute({ publicPage = false, adminOnly = false, sellerOnly = false }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <Loader className="w-8 h-8 text-[#FF9900] animate-spin" />
      </div>
    );
  }

  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const isSeller = user?.roles?.includes('ROLE_SELLER');

  if (publicPage) {
    return user ? <Navigate to="/" replace /> : <Outlet />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly) {
    if (!isAdmin) {
      return <Navigate to={isSeller ? "/seller/products" : "/"} replace />;
    }
  }

  if (sellerOnly) {
    if (!isSeller && !isAdmin) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
