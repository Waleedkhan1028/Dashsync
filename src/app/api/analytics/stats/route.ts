import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth-server";

/**
 * GET /api/analytics/stats
 * Fetch aggregated analytics statistics
 * Query params: timeRange (7d, 30d, 90d, all)
 */
export async function GET(req: Request) {
    try {
        const { user, client: supabase } = await getAuth(req);
        if (!user || !supabase) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const timeRange = searchParams.get("timeRange") || "30d";

        // Calculate date threshold
        const now = new Date();
        let dateThreshold: Date;
        
        switch (timeRange) {
            case "7d":
                dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case "30d":
                dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case "90d":
                dateThreshold = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case "all":
            default:
                dateThreshold = new Date(0); // Beginning of time
                break;
        }

        // Get total events count
        const { count: totalEvents, error: countError } = await supabase
            .from("analytics_events")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .gte("created_at", dateThreshold.toISOString());

        if (countError) {
            console.error("Error counting events:", countError);
            return NextResponse.json({ error: countError.message }, { status: 500 });
        }

        // Get event breakdown by type
        const { data: events, error: eventsError } = await supabase
            .from("analytics_events")
            .select("event_name")
            .eq("user_id", user.id)
            .gte("created_at", dateThreshold.toISOString());

        if (eventsError) {
            console.error("Error fetching events:", eventsError);
            return NextResponse.json({ error: eventsError.message }, { status: 500 });
        }

        // Calculate breakdown
        const breakdown: Record<string, number> = {};
        events?.forEach((event: { event_name: string }) => {
            breakdown[event.event_name] = (breakdown[event.event_name] || 0) + 1;
        });

        // Find most common event
        const sortedEvents = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
        const mostCommonEvent = sortedEvents[0]?.[0] || "None";

        return NextResponse.json({
            totalEvents: totalEvents || 0,
            breakdown,
            mostCommonEvent,
            timeRange,
        });
    } catch (error: unknown) {
        console.error("Unexpected error GET /api/analytics/stats:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
