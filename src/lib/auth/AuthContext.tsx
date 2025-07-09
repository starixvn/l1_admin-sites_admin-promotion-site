"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  setUser: (user: any) => void;
  setIsAuthenticated: (auth: boolean) => void;
  login: (data: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  // Check if cookie has expired
  const isCookieExpired = () => {
    try {
      const userCookie = Cookies.get('user');
      return !userCookie;
    } catch (e) {
      return true;
    }
  };

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

    const interval = setInterval(() => {
      if (isAuthenticated && isCookieExpired()) {
        logout();
      }
    }, 60 * 1000); 

    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const login = (data: any) => {
    setUser(data);
    setIsAuthenticated(true);
    // Set cookie with 3 hours expiry
    Cookies.set('user', JSON.stringify(data), { expires: 1/8 }); // 3 hours = 1/8 days
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    Cookies.remove('user');
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, setUser, setIsAuthenticated, login, logout }}>
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