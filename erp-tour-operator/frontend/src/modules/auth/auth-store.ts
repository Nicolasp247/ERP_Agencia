import { persist } from "zustand/middleware";
import { create } from "zustand";

type AuthUser = {
  id: number;
  nombre: string;
  email: string;
  roles: string[];
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  setSession: (session: { token: string; user: AuthUser }) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: ({ token, user }) => set({ token, user }),
      clearSession: () => set({ token: null, user: null })
    }),
    {
      name: "erp-tour-operator-session"
    }
  )
);
