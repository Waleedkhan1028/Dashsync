import { createClient, User } from "@supabase/supabase-js";

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

export async function getAuth(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) return { user: null, client: null };

        const token = authHeader.startsWith("Bearer ")
            ? authHeader.substring(7)
            : authHeader;

        if (!token) return { user: null, client: null };

        const client = getAuthClient(req, token);
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

export async function getAuthUser(req: Request): Promise<User | null> {
    const { user } = await getAuth(req);
    return user;
}
