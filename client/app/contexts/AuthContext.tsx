import {jwtDecode} from 'jwt-decode'
import axiosClient from '../lib/axios.ts'
import { storage } from '../lib/storage.ts'
import { createContext, useContext, useEffect, useState } from 'react';

export interface AuthUser {
  sub: string;
  email: string;
  role?: string;
  name?: string;
}

interface AuthContextType {
  user: AuthUser | undefined;
  login: (credentials: LoginDTO) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface LoginDTO {
  email: string;
  password: string;
}

const AuthContext = createContext(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = storage.getToken();
    if (token) {
      try {
        setUser(jwtDecode<AuthUser>(token));
      } catch {
        storage.clearToken();
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginDTO) => {
    // Simulate a successful login
    const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwibmFtZSI6IlRlc3QgVXNlciIsInJvbGUiOiJ1c2VyIn0.dummySignature";
    storage.setToken(fakeToken);
    setUser(jwtDecode<AuthUser>(fakeToken));
  };

  const logout = () => {
    storage.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}


