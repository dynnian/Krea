// contexts/AuthContext.tsx
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';                       // <-- import axios for type guard
import { createContext, useContext, useEffect, useState } from 'react';
import axiosClient from '../lib/axios';
import { storage } from '../lib/storage';

// Token payload from JWT (based on your actual token)
interface TokenPayload {
  sub: string;           // user id (UUID)
  unique_name: string;   // username
  email: string;
  displayName: string;
  exp?: number;
  iss?: string;
  aud?: string;
  role?: string;         // if present
}

// User object returned from /Auth/login
interface UserResponse {
  id: string;
  username: string;
  email: string;
  displayName: string;
  biography: string | null;
  languageCode: string;
  timeZoneId: string;
}

// AuthUser for the app (id is string, not number)
export interface AuthUser {
  id: string;
  email: string;
  name: string;          // displayName
  handle: string;        // username
  biography?: string | null;
  languageCode?: string;
  timeZoneId?: string;
  role?: string;
}

export interface LoginDTO {
  email: string;         // from form, maps to emailOrUsername in backend
  password: string;
}
export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
  displayName: string;
  languageCode: string;
  timeZoneId: string;
  biography?: string | null;
}



interface AuthContextType {
  user: AuthUser | undefined;
  login: (credentials: LoginDTO, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterDTO, rememberMe?: boolean) => Promise<void>;  // nuevo
  confirmEmail: (userId: string, token: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | undefined>();
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = storage.getToken();
    const storedUser = storage.getUser() as AuthUser | undefined;

    if (token && storedUser) {
      // Optional: verify token expiration
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        const now = Date.now() / 1000;
        if (decoded.exp && decoded.exp < now) {
          // Token expired
          storage.clearAll();
          setUser(undefined);
        } else {
          setUser(storedUser);
        }
      } catch {
        // Invalid token
        storage.clearAll();
        setUser(undefined);
      }
    } else {
      // Inconsistent state
      storage.clearAll();
      setUser(undefined);
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginDTO, rememberMe = false) => {
    try {
      // 1. Call real backend
      const response = await axiosClient.post('/Auth/login', {
        emailOrUsername: credentials.email,
        password: credentials.password,
      });

      const { token, user } = response.data as { token: string; user: UserResponse };

      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      // 2. Build AuthUser from the user object
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.displayName,
        handle: user.username,
        biography: user.biography,
        languageCode: user.languageCode,
        timeZoneId: user.timeZoneId,
      };

      // 3. Optionally extract role from token
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        if (decoded.role) {
          authUser.role = decoded.role;
        }
      } catch {
        // ignore
      }

      // 4. Store token and user with rememberMe preference
      storage.setToken(token, rememberMe);
      storage.setUser(authUser, rememberMe);

      // 5. Update state
      setUser(authUser);
    } catch (error) {
      // 6. Enhanced error handling
      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data;
        const message =
          data?.message ||
          data?.title ||
          (data?.errors ? Object.values(data.errors).flat().join(' ') : null) ||
          'Login failed';
        throw new Error(message);
      }
      throw new Error('Network error. Please check your connection.');
    }
  };
  const register = async (data: RegisterDTO, rememberMe = false) => {
    try {
      await axiosClient.post('/Auth/register', data);
      // No guardamos token ni usuario – la cuenta requiere confirmación
      return;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data;
        const message =
          data?.message ||
          data?.title ||
          (data?.errors ? Object.values(data.errors).flat().join(' ') : null) ||
          'Registration failed';
        throw new Error(message);
      }
      throw new Error('Network error. Please check your connection.');
    }
  };
  const confirmEmail = async (userId: string, token: string) => {
    try {
      await axiosClient.get('/Auth/confirm-email', {
        params: { userId, token }
      });
      // If the request succeeds, the email is confirmed.
      // No token or user is returned – the user must log in manually.
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data;
        const message = data?.message || data?.title || 'Email confirmation failed';
        throw new Error(message);
      }
      throw new Error('Network error');
    }
  };
  

  const logout = () => {
    storage.clearAll();
    setUser(undefined);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        confirmEmail,
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
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}