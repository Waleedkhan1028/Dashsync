import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth-server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user, client: supabase } = await getAuth(req);
        if (!user || !supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: workspaceId } = await params;

        const { data, error } = await supabase
            .from("projects")
            .select("*, tasks(count)")
            .eq("workspace_id", workspaceId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error(`Supabase error GET /api/workspaces/${workspaceId}/projects:`, error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Unexpected error GET projects:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user, client: supabase } = await getAuth(req);
        if (!user || !supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: workspaceId } = await params;
        const { name } = await req.json();

        const { data, error } = await supabase
            .from("projects")
            .insert([{ name, workspace_id: workspaceId }])
            .select()
            .single();

        if (error) {
            console.error(`Supabase error POST /api/workspaces/${workspaceId}/projects:`, error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Unexpected error POST project:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
