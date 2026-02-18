import { createClient, User } from "@supabase/supabase-js";

// ─── How auth works in API routes ────────────────────────────────────────────
//
// Every API request from the browser includes a JWT token in the header:
//   Authorization: Bearer <token>
//
// These helpers extract that token, verify it with Supabase, and return
// the logged-in user so API routes know who is making the request.
//
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a Supabase client that "acts as" the logged-in user.
 *
 * By passing the user's JWT token in the Authorization header, any database
 * queries made with this client will respect Row Level Security (RLS) policies
 * — meaning users can only read/write their own data.
 */
export function getAuthClient(req: Request, token?: string) {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            },
        }
    );
}

/**
 * Extracts and verifies the JWT token from an incoming API request.
 *
 * Returns:
 *  - `user`   — the logged-in Supabase user (or null if not authenticated)
 *  - `client` — a Supabase client scoped to that user (for RLS-safe queries)
 *
 * Usage in an API route:
 *   const { user, client } = await getAuth(req);
 *   if (!user) return new Response("Unauthorized", { status: 401 });
 */
export async function getAuth(req: Request) {
    try {
        // 1. Read the Authorization header from the request
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) return { user: null, client: null };

        // 2. Strip the "Bearer " prefix to get the raw JWT token
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.substring(7)
            : authHeader;

        if (!token) return { user: null, client: null };

        // 3. Create a user-scoped Supabase client using the token
        const client = getAuthClient(req, token);

        // 4. Ask Supabase to verify the token and return the user
        const { data: { user }, error } = await client.auth.getUser(token);

        if (error || !user) {
            console.warn("getAuth: No user found or session error.", error);
            return { user: null, client: null };
        }

        console.log(`getAuth: Found user ${user.id} (${user.email})`);
        return { user, client };
    } catch (e) {
        console.error("getAuth: Unexpected error", e);
        return { user: null, client: null };
    }
}

/**
 * Shorthand for when you only need the user, not the Supabase client.
 *
 * Usage:
 *   const user = await getAuthUser(req);
 *   if (!user) return new Response("Unauthorized", { status: 401 });
 */
export async function getAuthUser(req: Request): Promise<User | null> {
    const { user } = await getAuth(req);
    return user;
}

