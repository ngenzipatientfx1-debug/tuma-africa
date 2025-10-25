import { create} from "zustand";
import { apiGet, apiPost, setAuthToken, clearAuthToken, getAuthToken } from "@/lib/api";
import type { User } from "@shared/schema";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiPost<{ user: User; token: string }>("/api/auth/login", {
        email,
        password,
      });
      
      setAuthToken(response.token);
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiPost<{ user: User; token: string }>("/api/auth/register", data);
      
      setAuthToken(response.token);
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    clearAuthToken();
    set({ user: null, isAuthenticated: false });
    window.location.href = "/";
  },

  fetchUser: async () => {
    const token = getAuthToken();
    
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    try {
      set({ isLoading: true });
      const user = await apiGet<User>("/api/auth/user");
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      clearAuthToken();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

// Initialize auth on app load
if (getAuthToken()) {
  useAuth.getState().fetchUser();
} else {
  useAuth.setState({ isLoading: false });
}
