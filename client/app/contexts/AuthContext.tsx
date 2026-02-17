import { jwtDecode } from 'jwt-decode';
import axiosClient from '../lib/axios.ts';
import { storage } from '../lib/storage.ts';
import { createContext, useContext, useEffect, useState } from 'react';

// Token payload original
interface TokenPayload {
  sub: string;
  email: string;
  role?: string;
  name?: string;
  // Si el token incluye avatar u otros, añádelos aquí
}

// Usuario enriquecido para la UI
export interface AuthUser {
  id: number;           // número a partir de sub
  sub: string;          // el original
  email: string;
  name: string;         // siempre string (si no viene, usamos email)
  handle: string;       // derivado del email (parte antes de @)
  avatar?: string;      // si el token lo trae, o undefined
  role?: string;
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

const AuthContext = createContext<AuthContextType | null>(null);

function enrichUser(tokenPayload: TokenPayload): AuthUser {
  // Derivar handle del email (parte antes de @)
  const handle = tokenPayload.email.split('@')[0];
  // Convertir sub a número (si es string numérico) o usar 0 como fallback
  const id = parseInt(tokenPayload.sub) || 0;
  return {
    id,
    sub: tokenPayload.sub,
    email: tokenPayload.email,
    name: tokenPayload.name || tokenPayload.email.split('@')[0],
    handle,
    role: tokenPayload.role,
    // avatar: tokenPayload.avatar, // si existiera en el token
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = storage.getToken();
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setUser(enrichUser(decoded));
      } catch {
        storage.clearToken();
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginDTO) => {
    // Simulación de login exitoso
    const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwibmFtZSI6IlRlc3QgVXNlciIsInJvbGUiOiJ1c2VyIn0.dummySignature";
    storage.setToken(fakeToken);
    const decoded = jwtDecode<TokenPayload>(fakeToken);
    setUser(enrichUser(decoded));
  };

  const logout = () => {
    storage.clearToken();
    setUser(undefined);
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