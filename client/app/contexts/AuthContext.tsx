// contexts/AuthContext.tsx
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import axiosClient from '../lib/axios.ts';
import { storage } from '../lib/storage.ts';
import { initSignalR, stopSignalR } from '../services/signalrListener';
// Token payload from JWT (based on your actual token)
interface TokenPayload {
  sub: string;
  unique_name: string;
  email: string;
  displayName: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string; // <-- add this
  exp?: number;
  iss?: string;
  aud?: string;
}

// User object returned from /Auth/login (inside the response)
interface UserResponse {
  id: string;
  username: string;
  email: string;
  displayName: string;
  biography: string | null;
  languageCode: string;
  timeZoneId: string;
  roleId: number;        // note: roleId, not role string
}

// Complete login response from backend
interface LoginResponse {
  token: string;
  expiration: string;    // ISO date string
  user: UserResponse;
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
  role?: string;         // optional, can be derived from token
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
  register: (data: RegisterDTO, rememberMe?: boolean) => Promise<void>;
  confirmEmail: (userId: string, token: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | undefined>();
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(false);
  
  useEffect(() => {
    if (user) {
      // Small delay to ensure everything is settled
      const timer = setTimeout(() => {
        initSignalR(user.id);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user]);
  // Restore session on mount
  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;
    const token = storage.getToken();
    const storedUser = storage.getUser() as AuthUser | undefined;

    if (token && storedUser) {
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
      // Call backend login endpoint
      const response = await axiosClient.post('/Auth/login', {
        emailOrUsername: credentials.email,
        password: credentials.password,
      });

      // The response data matches the LoginResponse interface
      const data = response.data as LoginResponse;

      const { token, user: userData } = data;

      if (!token || !userData) {
        throw new Error('Invalid response from server');
      }

      // Build AuthUser from the user object
      const authUser: AuthUser = {
        id: userData.id,
        email: userData.email,
        name: userData.displayName,
        handle: userData.username,
        biography: userData.biography,
        languageCode: userData.languageCode,
        timeZoneId: userData.timeZoneId,
      };

      // Optionally extract role from token (if needed)
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        const roleClaim = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        if (roleClaim) {
          authUser.role = roleClaim; // "Admin" for admin users
        }
      } catch {
        // ignore
      }

      // Store token and user with rememberMe preference
      storage.setToken(token, rememberMe);
      storage.setUser(authUser, rememberMe);
      // Update state
      setUser(authUser);
    } catch (error) {
      // Enhanced error handling
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
      // No token or user returned – account requires confirmation
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
      // The user must log in manually.
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
    stopSignalR();

  };
    const value = useMemo(() => ({
    user,
    login,
    register,
    confirmEmail,
    logout,
    isAuthenticated: !!user,
    loading,
  }), [user, login, register, confirmEmail, logout, loading]);
  return (
    <AuthContext.Provider
      value={value}
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