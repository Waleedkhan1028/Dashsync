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
            .from("projects")
            .select("*")
            .eq("id", projectId)
            .single();

        if (error) {
            console.error(`Supabase error GET /api/projects/${projectId}:`, error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Unexpected error GET project:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user, client: supabase } = await getAuth(req);
        if (!user || !supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: projectId } = await params;
        const { name } = await req.json();

        const { data, error } = await supabase
            .from("projects")
            .update({ name })
            .eq("id", projectId)
            .select()
            .single();

        if (error) {
            console.error(`Supabase error PATCH /api/projects/${projectId}:`, error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Unexpected error PATCH project:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user, client: supabase } = await getAuth(req);
        if (!user || !supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: projectId } = await params;

        // 1. Delete all tasks associated with this project
        const { error: tasksError } = await supabase
            .from("tasks")
            .delete()
            .eq("project_id", projectId);

        if (tasksError) {
            console.error(`Supabase error DELETE tasks for project ${projectId}:`, tasksError);
            return NextResponse.json({ error: tasksError.message }, { status: 500 });
        }

        // 2. Delete the project
        const { error } = await supabase
            .from("projects")
            .delete()
            .eq("id", projectId);

        if (error) {
            console.error(`Supabase error DELETE /api/projects/${projectId}:`, error);
            // Attempt to inform about potential lingering data if partial project delete failed, 
            // but we can't rollback easily without transactions (not used here for simplicity).
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Unexpected error DELETE project:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
