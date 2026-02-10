import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth-server";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user, client: supabase } = await getAuth(req);
        if (!user || !supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: workspaceId } = await params;
        const { name } = await req.json();

        const { data, error } = await supabase
            .from("workspaces")
            .update({ name })
            .eq("id", workspaceId)
            .select()
            .single();

        if (error) {
            console.error(`Supabase error PATCH /api/workspaces/${workspaceId}:`, error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Unexpected error PATCH workspace:", error);
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

        const { id: workspaceId } = await params;

        const { error } = await supabase
            .from("workspaces")
            .delete()
            .eq("id", workspaceId);

        if (error) {
            console.error(`Supabase error DELETE /api/workspaces/${workspaceId}:`, error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Unexpected error DELETE workspace:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
