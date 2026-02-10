import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth-server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { user, client: supabase } = await getAuth(req);

    if (!user || !supabase) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { user, client: supabase } = await getAuth(req);

        if (!user || !supabase) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!body.content || typeof body.content !== 'string') {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("comments")
            .insert([
                {
                    content: body.content,
                    project_id: id,
                    user_id: user.id
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Supabase error creating comment:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const result = {
            ...data,
            user_email: user.email
        };

        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error("Unexpected error in POST /api/projects/[id]/comments:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: (error as Error).message },
            { status: 500 }
        );
    }
}
