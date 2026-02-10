import { supabase } from "./supabase";

export async function fetcher<T>(url: string, init?: RequestInit): Promise<T> {
    const { data: { session } } = await supabase.auth.getSession();

    const headers = new Headers(init?.headers);
    if (session?.access_token) {
        headers.set("Authorization", `Bearer ${session.access_token}`);
    }

    const res = await fetch(url, {
        ...init,
        headers,
    });

    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        // Throw a plain object or Error with properties, no custom class
        const message = errorBody.error || errorBody.message || "API Error";
        throw new Error(message);
    }

    if (res.status === 204) {
        return {} as T;
    }

    return res.json();
}
