import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth-server";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user, client: supabase } = await getAuth(req);
        if (!user || !supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: taskId } = await params;
        const { title, status } = await req.json();

        const { data, error } = await supabase
            .from("tasks")
            .update({ title, status })
            .eq("id", taskId)
            .select()
            .single();

        if (error) {
            console.error(`Supabase error PATCH /api/tasks/${taskId}:`, error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error("Unexpected error PATCH task:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user, client: supabase } = await getAuth(req);
        if (!user || !supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: taskId } = await params;

        const { error } = await supabase
            .from("tasks")
            .delete()
            .eq("id", taskId);

        if (error) {
            console.error(`Supabase error DELETE /api/tasks/${taskId}:`, error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Unexpected error DELETE task:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
