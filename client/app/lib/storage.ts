const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const REMEMBER_ME_KEY = 'rememberMe';

export const storage = {
  getToken: () => {
    // Primero intentar sessionStorage, luego localStorage
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string, rememberMe: boolean) => {
    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, token);
      sessionStorage.removeItem(TOKEN_KEY);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.removeItem(TOKEN_KEY);
    }
    storage.setRememberMe(rememberMe);
  },
  getUser: () => {
    const userStr = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },
  setUser: (user: any, rememberMe: boolean) => {
    const userStr = JSON.stringify(user);
    if (rememberMe) {
      localStorage.setItem(USER_KEY, userStr);
      sessionStorage.removeItem(USER_KEY);
    } else {
      sessionStorage.setItem(USER_KEY, userStr);
      localStorage.removeItem(USER_KEY);
    }
  },
  clearAll: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
  setRememberMe: (rememberMe: boolean) => {
    localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(rememberMe));
  },
  getRememberMe: () => {
    const val = localStorage.getItem(REMEMBER_ME_KEY);
    return val ? JSON.parse(val) : false;
  },
};