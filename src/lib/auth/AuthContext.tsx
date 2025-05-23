"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user is logged in on mount
    const userCookie = Cookies.get('user');
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (e) {
        // If cookie is invalid, clear it
        Cookies.remove('user');
      }
    }
  }, []);

  useEffect(() => {
    // Protect routes
    const publicPaths = ['/login', '/signup', '/forgot-password'];
    if (!isAuthenticated && !publicPaths.includes(pathname)) {
      router.push('/login');
    }
  }, [isAuthenticated, pathname, router]);

  const login = async (data: any) => {
    setUser(data);
    setIsAuthenticated(true);
    // Set cookie with 7 days expiry
    Cookies.set('user', JSON.stringify(data), { expires: 7 });
    
    // Redirect to the original requested page or default to promotion
    const from = searchParams.get('from');
    router.push(from || '/promotion');
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    Cookies.remove('user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 