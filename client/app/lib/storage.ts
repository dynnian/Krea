const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const REMEMBER_ME_KEY = 'rememberMe';

const isStorageAvailable = (type: 'localStorage' | 'sessionStorage') => {
  try {
    const storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
};

const safeGet = (type: 'localStorage' | 'sessionStorage', key: string) => {
  if (typeof window === 'undefined') return null;
  try {
    return window[type].getItem(key);
  } catch (e) {
    return null;
  }
};

const safeSet = (type: 'localStorage' | 'sessionStorage', key: string, value: string) => {
  if (typeof window === 'undefined') return;
  try {
    window[type].setItem(key, value);
  } catch (e) {
    // Silent fail
  }
};

const safeRemove = (type: 'localStorage' | 'sessionStorage', key: string) => {
  if (typeof window === 'undefined') return;
  try {
    window[type].removeItem(key);
  } catch (e) {
    // Silent fail
  }
};

export const storage = {
  getToken: () => {
    return safeGet('sessionStorage', TOKEN_KEY) || safeGet('localStorage', TOKEN_KEY);
  },
  setToken: (token: string, rememberMe: boolean) => {
    if (rememberMe) {
      safeSet('localStorage', TOKEN_KEY, token);
      safeRemove('sessionStorage', TOKEN_KEY);
    } else {
      safeSet('sessionStorage', TOKEN_KEY, token);
      safeRemove('localStorage', TOKEN_KEY);
    }
    storage.setRememberMe(rememberMe);
  },
  getUser: () => {
    const userStr = safeGet('sessionStorage', USER_KEY) || safeGet('localStorage', USER_KEY);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },
  setUser: (user: any, rememberMe: boolean) => {
    const userStr = JSON.stringify(user);
    if (rememberMe) {
      safeSet('localStorage', USER_KEY, userStr);
      safeRemove('sessionStorage', USER_KEY);
    } else {
      safeSet('sessionStorage', USER_KEY, userStr);
      safeRemove('localStorage', USER_KEY);
    }
  },
  clearAll: () => {
    safeRemove('localStorage', TOKEN_KEY);
    safeRemove('localStorage', USER_KEY);
    safeRemove('localStorage', REMEMBER_ME_KEY);
    safeRemove('sessionStorage', TOKEN_KEY);
    safeRemove('sessionStorage', USER_KEY);
  },
  setRememberMe: (rememberMe: boolean) => {
    safeSet('localStorage', REMEMBER_ME_KEY, JSON.stringify(rememberMe));
  },
  getRememberMe: () => {
    const val = safeGet('localStorage', REMEMBER_ME_KEY);
    try {
      return val ? JSON.parse(val) : false;
    } catch (e) {
      return false;
    }
  },
};