import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

export interface Passenger {
  name: string;
  age: number;
  gender: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  savedPassengers: Passenger[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (email: string, name: string, googleId: string) => Promise<void>;
  logout: () => void;
  updatePassengers: (passengers: Passenger[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('tripease_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const profile = await api.get<User>('/auth/profile');
          setUser(profile);
        } catch (err) {
          console.error('Failed to load user profile', err);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    localStorage.setItem('tripease_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api.post<{ token: string; user: User }>('/auth/register', { name, email, password });
    localStorage.setItem('tripease_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const googleLogin = async (email: string, name: string, googleId: string) => {
    const data = await api.post<{ token: string; user: User }>('/auth/google', { email, name, googleId });
    localStorage.setItem('tripease_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('tripease_token');
    setToken(null);
    setUser(null);
  };

  const updatePassengers = async (savedPassengers: Passenger[]) => {
    const updatedList = await api.put<Passenger[]>('/auth/passengers', { savedPassengers });
    if (user) {
      setUser({ ...user, savedPassengers: updatedList });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, googleLogin, logout, updatePassengers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
