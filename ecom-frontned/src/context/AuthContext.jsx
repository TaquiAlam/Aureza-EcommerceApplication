import { createContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, signin as signinApi, signup as signupApi, signout as signoutApi } from '../api/authApi';
import { getUserProfile } from '../api/userApi';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
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
    try {
      const res = await getCurrentUser();
      setUser(res.data);
      if (res.data) {
        await fetchProfile();
      }
    } catch {
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
    setUser(res.data);
    await fetchProfile();
    toast.success(`Welcome back, ${res.data.username}!`);
    return res.data;
  };

  const register = async (username, email, password) => {
    await signupApi(username, email, password);
    toast.success('Account created! Please sign in.');
  };

  const logout = async () => {
    await signoutApi();
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

