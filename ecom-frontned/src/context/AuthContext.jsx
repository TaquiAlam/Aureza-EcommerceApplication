import { createContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, signin as signinApi, signup as signupApi, signout as signoutApi } from '../api/authApi';
import { getUserProfile } from '../api/userApi';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await getUserProfile();
      setProfile(res.data);
      return res.data;
    } catch {
      setProfile(null);
      return null;
    }
  }, []);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token && !localStorage.getItem('user')) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const res = await getCurrentUser();
      setUser(res.data);
      if (res.data?.jwtToken) {
        localStorage.setItem('token', res.data.jwtToken);
      }
      localStorage.setItem('user', JSON.stringify(res.data));
      await fetchProfile();
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (username, password) => {
    const res = await signinApi(username, password);
    if (res.data?.jwtToken) {
      localStorage.setItem('token', res.data.jwtToken);
    }
    localStorage.setItem('user', JSON.stringify(res.data));
    setUser(res.data);
    await fetchProfile();
    toast.success(`Welcome back, ${res.data.username}!`);
    return res.data;
  };

  const register = async (username, email, password, role = 'user') => {
    const roles = Array.isArray(role) ? role : [role];
    await signupApi(username, email, password, roles);
    if (roles.includes('seller') || roles.includes('ROLE_SELLER')) {
      toast.success('Seller Partner account created! Please sign in to access your Seller Portal.');
    } else {
      toast.success('Account created! Please sign in.');
    }
  };

  const logout = async () => {
    try {
      await signoutApi();
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
    toast.success("You've been signed out!");
  };

  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const isSeller = user?.roles?.includes('ROLE_SELLER');

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        setProfile,
        fetchProfile,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isSeller,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

