/**
 * FoodHunt — Auth Context
 * Manages user authentication state across the app
 */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, safeGetItem, safeSetItem, safeRemoveItem } from '../api';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  preferences: {
    dark_mode: boolean;
    sound: boolean;
    notifications?: boolean;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  appleLogin: (idToken: string, user?: any) => Promise<void>;
  logout: () => void;
  updatePreferences: (prefs: Partial<User['preferences']>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'foodhunt_token';
const USER_KEY = 'foodhunt_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Restore session on mount
  useEffect(() => {
    const token = safeGetItem('local', TOKEN_KEY);
    const userStr = safeGetItem('local', USER_KEY);
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setState({ user, token, isLoading: false, isAuthenticated: true });
        // Verify token is still valid
        authApi.getProfile(token).catch(() => {
          safeRemoveItem('local', TOKEN_KEY);
          safeRemoveItem('local', USER_KEY);
          setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
        });
      } catch {
        setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
      }
    } else {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    safeSetItem('local', TOKEN_KEY, data.token);
    safeSetItem('local', USER_KEY, JSON.stringify(data.user));
    setState({ user: data.user, token: data.token, isLoading: false, isAuthenticated: true });
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const data = await authApi.register(email, password, name);
    safeSetItem('local', TOKEN_KEY, data.token);
    safeSetItem('local', USER_KEY, JSON.stringify(data.user));
    setState({ user: data.user, token: data.token, isLoading: false, isAuthenticated: true });
  }, []);

  const googleLogin = useCallback(async (credential: string) => {
    const data = await authApi.googleLogin(credential);
    safeSetItem('local', TOKEN_KEY, data.token);
    safeSetItem('local', USER_KEY, JSON.stringify(data.user));
    setState({ user: data.user, token: data.token, isLoading: false, isAuthenticated: true });
  }, []);

  const appleLogin = useCallback(async (idToken: string, user?: any) => {
    const data = await authApi.appleLogin(idToken, user);
    safeSetItem('local', TOKEN_KEY, data.token);
    safeSetItem('local', USER_KEY, JSON.stringify(data.user));
    setState({ user: data.user, token: data.token, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(() => {
    safeRemoveItem('local', TOKEN_KEY);
    safeRemoveItem('local', USER_KEY);
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
  }, []);

  const updatePreferences = useCallback(async (prefs: Partial<User['preferences']>) => {
    if (!state.token) return;
    await authApi.updatePreferences(state.token, prefs);
    if (state.user) {
      const updated = { ...state.user, preferences: { ...state.user.preferences, ...prefs } };
      safeSetItem('local', USER_KEY, JSON.stringify(updated));
      setState(s => ({ ...s, user: updated }));
    }
  }, [state.token, state.user]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, googleLogin, appleLogin, logout, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
