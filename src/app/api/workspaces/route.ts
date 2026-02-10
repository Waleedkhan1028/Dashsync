import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth-server";

export async function GET(req: Request) {
    try {
        const { user, client: supabase } = await getAuth(req);
        if (!user || !supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data, error, count } = await supabase
            .from("workspaces")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Supabase error GET /api/workspaces:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log(`GET /api/workspaces: returned ${data?.length} rows (count: ${count})`);
        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error("Unexpected error GET /api/workspaces:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { user, client: supabase } = await getAuth(req);
        if (!user || !supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { name } = await req.json();

        const { data, error } = await supabase
            .from("workspaces")
            .insert([{ name, user_id: user.id }])
            .select()
            .single();

        if (error) {
            console.error("Supabase error POST /api/workspaces:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error("Unexpected error POST /api/workspaces:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
