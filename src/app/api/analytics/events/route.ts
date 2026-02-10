import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth-server";

/**
 * POST /api/analytics/events
 * Store analytics events in database
 */
export async function POST(req: Request) {
    try {
        const { user, client: supabase } = await getAuth(req);
        if (!user || !supabase) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { event_name, properties } = await req.json();

        if (!event_name) {
            return NextResponse.json({ error: "event_name is required" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("analytics_events")
            .insert([
                {
                    user_id: user.id,
                    event_name,
                    properties: properties || {},
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Supabase error POST /api/analytics/events:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Unexpected error POST /api/analytics/events:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
