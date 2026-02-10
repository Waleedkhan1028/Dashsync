import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth-server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user, client: supabase } = await getAuth(req);
        if (!user || !supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: projectId } = await params;

        const { data, error } = await supabase
            .from("tasks")
            .select("*")
            .eq("project_id", projectId)
            .order("created_at", { ascending: true });

        if (error) {
            console.error(`Supabase error GET /api/projects/${projectId}/tasks:`, error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error("Unexpected error GET tasks:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user, client: supabase } = await getAuth(req);
        if (!user || !supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: projectId } = await params;
        const { title, status = "todo" } = await req.json();

        const { data, error } = await supabase
            .from("tasks")
            .insert([{ title, status, project_id: projectId }])
            .select()
            .single();

        if (error) {
            console.error(`Supabase error POST /api/projects/${projectId}/tasks:`, error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error("Unexpected error POST task:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
