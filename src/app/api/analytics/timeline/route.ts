import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth-server";

/**
 * GET /api/analytics/timeline
 * Fetch time-series data for charts
 * Query params: timeRange (7d, 30d, 90d, all), groupBy (hour, day, week)
 */
export async function GET(req: Request) {
    try {
        const { user, client: supabase } = await getAuth(req);
        if (!user || !supabase) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const timeRange = searchParams.get("timeRange") || "30d";
        const groupBy = searchParams.get("groupBy") || "day";

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
                dateThreshold = new Date(0);
                break;
        }

        // Fetch all events in time range
        const { data: events, error } = await supabase
            .from("analytics_events")
            .select("event_name, created_at")
            .eq("user_id", user.id)
            .gte("created_at", dateThreshold.toISOString())
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error fetching timeline:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Group events by time period
        const grouped: Record<string, Record<string, number>> = {};
        
        events?.forEach((event: { event_name: string; created_at: string }) => {
            const date = new Date(event.created_at);
            let key: string;

            if (groupBy === "hour") {
                key = date.toISOString().slice(0, 13) + ":00:00.000Z";
            } else if (groupBy === "week") {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toISOString().slice(0, 10);
            } else { // day
                key = date.toISOString().slice(0, 10);
            }

            if (!grouped[key]) {
                grouped[key] = {};
            }
            grouped[key][event.event_name] = (grouped[key][event.event_name] || 0) + 1;
        });

        // Convert to array format for charts
        const timeline = Object.entries(grouped).map(([timestamp, eventCounts]) => ({
            timestamp,
            total: Object.values(eventCounts).reduce((sum, count) => sum + count, 0),
            ...eventCounts,
        }));

        return NextResponse.json({ timeline, timeRange, groupBy });
    } catch (error: any) {
        console.error("Unexpected error GET /api/analytics/timeline:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
