import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { User, AuthError } from "@supabase/supabase-js";

// ─── Types ───────────────────────────────────────────────────────────────────

type AuthState = {
    // The currently logged-in user, or null if not logged in
    user: User | null;

    // True while we're checking if the user is already logged in (e.g. on page load)
    isLoading: boolean;

    // Manually set the user (used internally)
    setUser: (user: User | null) => void;

    // Called once on app start — checks if a session already exists
    checkAuth: () => Promise<void>;

    // Log in with email + password
    signIn: (credentials: { email: string; password: string }) => Promise<{ error: AuthError | null }>;

    // Create a new account
    signUp: (credentials: { email: string; password: string; name: string }) => Promise<{ error: AuthError | null }>;

    // Log out and redirect to login page
    signOut: () => Promise<void>;
};

// ─── Store ───────────────────────────────────────────────────────────────────

/**
 * useAuthStore — global auth state powered by Zustand.
 *
 * Usage:
 *   const user = useAuthStore((s) => s.user);
 *   const { signIn, signOut } = useAuthStore();
 */
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,

    // Directly update the user in state
    setUser: (user) => set({ user, isLoading: false }),

    // On app load, check if the user already has a valid session (e.g. from a cookie).
    // Also subscribes to future auth changes (login, logout, token refresh).
    checkAuth: async () => {
        set({ isLoading: true });

        // Fetch the current session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        set({ user: session?.user ?? null, isLoading: false });

        // Keep the store in sync whenever auth state changes
        supabase.auth.onAuthStateChange((_event, session) => {
            set({ user: session?.user ?? null, isLoading: false });
        });
    },

    // Sign in with email + password.
    // Supabase stores the session automatically (in localStorage/cookies).
    signIn: async ({ email, password }) => {
        const result = await supabase.auth.signInWithPassword({ email, password });
        return { error: result.error };
    },

    // Create a new account. The user's display name is stored in Supabase metadata.
    signUp: async ({ email, password, name }) => {
        const result = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name }, // stored in auth.users metadata
            },
        });
        return { error: result.error };
    },

    // Clear the session from Supabase, reset local state, and send user to login
    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null });
        window.location.href = "/auth/login";
    },
}));