// lib/storage.ts
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const storage = {
  // Token methods
  getToken: () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY),
  setToken: (token: string, remember: boolean = true) => {
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
      sessionStorage.removeItem(TOKEN_KEY);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.removeItem(TOKEN_KEY);
    }
  },
  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },

  // User methods
  getUser: () => {
    const userStr = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return undefined;
      }
    }
    return undefined;
  },
  setUser: (user: any, remember: boolean = true) => {  // 'any' can be replaced with AuthUser type
    const userStr = JSON.stringify(user);
    if (remember) {
      localStorage.setItem(USER_KEY, userStr);
      sessionStorage.removeItem(USER_KEY);
    } else {
      sessionStorage.setItem(USER_KEY, userStr);
      localStorage.removeItem(USER_KEY);
    }
  },
  clearUser: () => {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  // Clear both
  clearAll: () => {
    storage.clearToken();
    storage.clearUser();
  },
};