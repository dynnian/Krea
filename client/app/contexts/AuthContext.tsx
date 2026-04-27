import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import axiosClient from '../lib/axios';
import { storage } from '../lib/storage';
import { initSignalR, stopSignalR } from '../services/signalrListener';

interface TokenPayload {
  sub: string;
  unique_name: string;
  email: string;
  displayName: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
  exp?: number;
}

interface UserResponse {
  id: string;
  username: string;
  email: string;
  displayName: string;
  biography: string | null;
  languageCode: string;
  timeZoneId: string;
  roleId: number;
}

interface LoginResponse {
  token: string;
  expiration: string;
  user: UserResponse;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  handle: string;
  profilePictureUrl?: string | null;
  biography?: string | null;
  languageCode?: string;
  timeZoneId?: string;
  role?: string;
}

export interface LoginDTO {
  emailOrUsername: string;
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
  register: (data: RegisterDTO, rememberMe?: boolean) => Promise<LoginResponse>;
  confirmEmail: (userId: string, token: string) => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | undefined>();
  const [loading, setLoading] = useState(true);
  const signalRInitialized = useRef(false);

  // Restaurar sesión al montar
  useEffect(() => {
    const token = storage.getToken();
    const storedUser = storage.getUser() as AuthUser | undefined;

    if (token && storedUser) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        const now = Date.now() / 1000;
        if (decoded.exp && decoded.exp < now) {
          storage.clearAll();
          setUser(undefined);
        } else {
          setUser(storedUser);
        }
      } catch {
        storage.clearAll();
        setUser(undefined);
      }
    } else {
      storage.clearAll();
      setUser(undefined);
    }
    setLoading(false);
  }, []);

  // Inicializar SignalR solo cuando el usuario esté autenticado y no se haya hecho antes
  useEffect(() => {
    if (user && !signalRInitialized.current) {
      signalRInitialized.current = true;
      (async () => {
        try {
          await initSignalR(user.id);
        } catch (err) {
          console.error('SignalR init failed:', err);
        }
      })();
    }
    if (!user && signalRInitialized.current) {
      stopSignalR();
      signalRInitialized.current = false;
    }
  }, [user]);

  const login = async (credentials: LoginDTO, rememberMe = false) => {
    try {
      const response = await axiosClient.post('/Auth/login', {
        emailOrUsername: credentials.emailOrUsername,
        password: credentials.password,
      });

      const data = response.data as LoginResponse;
      const { token, user: userData } = data;

      if (!token || !userData) throw new Error('Invalid response');

      const authUser: AuthUser = {
        id: userData.id,
        email: userData.email,
        name: userData.displayName,
        handle: userData.username,
        profilePictureUrl: null,
        biography: userData.biography,
        languageCode: userData.languageCode,
        timeZoneId: userData.timeZoneId,
      };

      // Extraer rol del token
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        const roleClaim = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        if (roleClaim) authUser.role = roleClaim;
      } catch {
        // ignore
      }

      storage.setToken(token, rememberMe);
      storage.setUser(authUser, rememberMe);

      // Actualizar el estado del usuario
      setUser(authUser);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data;
        const message = data?.error || data?.message || data?.title || 'Login failed';
        throw new Error(message);
      }
      throw new Error('Network error');
    }
  };

const register = async (data: RegisterDTO, rememberMe = false) => {
  try {
    const response = await axiosClient.post('/Auth/register', data);
    return response.data as LoginResponse;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const responseData = error.response.data;
      const message =
        responseData?.error ||
        responseData?.message ||
        responseData?.title ||
        'Registration failed';

      throw new Error(String(message).trim());
    }
    throw new Error('Network error');
  }
};

  const confirmEmail = async (userId: string, token: string) => {
    try {
      await axiosClient.get('/Auth/confirm-email', { params: { userId, token } });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data;
        throw new Error(data?.message || data?.title || 'Email confirmation failed');
      }
      throw new Error('Network error');
    }
  };

  const logout = () => {
    storage.clearAll();
    setUser(undefined);
    stopSignalR();
    signalRInitialized.current = false;
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    setUser((current) => {
      if (!current) {
        return current;
      }

      const nextUser = { ...current, ...updates };
      const rememberMe = storage.getRememberMe?.() ?? false;
      storage.setUser(nextUser, rememberMe);
      return nextUser;
    });
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    confirmEmail,
    updateUser,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}