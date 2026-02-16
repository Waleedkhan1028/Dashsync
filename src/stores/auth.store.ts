import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { User, AuthError } from "@supabase/supabase-js";

type AuthState = {
    user: User | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    checkAuth: () => Promise<void>;
    signIn: (credentials: { email: string; password: string }) => Promise<{ error: AuthError | null }>;
    signUp: (credentials: { email: string; password: string; name: string }) => Promise<{ error: AuthError | null }>;
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
    signIn: async ({ email, password }) => {
        const result = await supabase.auth.signInWithPassword({ email, password });
        return { error: result.error };
    },
    signUp: async ({ email, password, name }) => {
        const result = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name },
            },
        });
        return { error: result.error };
    },
    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null });
        window.location.href = "/auth/login";
    },
}));