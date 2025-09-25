import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
type User = {
  id: string;
  name: string;
  email: string;
  organizationId: string;
};
type AuthState = {
  user: User | null;
  authToken: string | null;
  isAuthenticated: boolean;
};
type AuthActions = {
  setAuth: (user: User, token: string) => void;
  logout: () => void;
};
export const useAuth = create<AuthState & AuthActions>()(
  persist(
    immer((set) => ({
      user: null,
      authToken: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        set((state) => {
          state.isAuthenticated = true;
          state.user = user;
          state.authToken = token;
        });
      },
      logout: () => {
        set((state) => {
          state.isAuthenticated = false;
          state.user = null;
          state.authToken = null;
        });
      },
    })),
    {
      name: 'fluxo-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);