import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

type AuthState = {
    user: User | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    checkAuth: () => Promise<void>;
    signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    setUser: (user) => set({ user, isLoading: false }),
    checkAuth: async () => {
        set({ isLoading: true });
        const { data: { session } } = await supabase.auth.getSession();
        set({ user: session?.user ?? null, isLoading: false });

        supabase.auth.onAuthStateChange((_event, session) => {
            set({ user: session?.user ?? null, isLoading: false });
        });
    },
    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null });
    },
}));