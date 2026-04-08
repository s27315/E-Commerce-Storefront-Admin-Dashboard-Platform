import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../lib/api';
import type { AuthContextType, User } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin123';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const login = async (email: string, password: string): Promise<'ADMIN' | 'USER'> => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser: User = { id: 'admin', name: 'Admin', email: ADMIN_EMAIL, role: 'ADMIN' };
      localStorage.setItem('token', 'admin-static-token');
      localStorage.setItem('user', JSON.stringify(adminUser));
      setUser(adminUser);
      return 'ADMIN';
    }
    const res = await api.post('/api/auth/users/login', { email, password });
    const { token, user: userData } = res.data;
    const role: 'ADMIN' | 'USER' = userData.role ?? 'USER';
    const fullUser: User = { ...userData, role };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(fullUser));
    setUser(fullUser);
    return role;
  };

  const register = async (name: string, email: string, password: string) => {
    await api.post('/api/auth/users/register', { email, password, name });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        userRole: user?.role ?? null,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
