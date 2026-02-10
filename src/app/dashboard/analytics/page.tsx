"use client";

import { useAuthStore } from "@/stores/auth.store";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import StatsCard from "@/components/analytics/StatsCard";
import TimeRangeSelector, { TimeRange } from "@/components/analytics/TimeRangeSelector";
import EventsChart from "@/components/analytics/EventsChart";
import EventDistribution from "@/components/analytics/EventDistribution";

type AnalyticsStats = {
    totalEvents: number;
    breakdown: Record<string, number>;
    mostCommonEvent: string;
    timeRange: string;
};

type AnalyticsTimeline = {
    timeline: Array<{ timestamp: string; total: number; [key: string]: any }>;
    timeRange: string;
    groupBy: string;
};

export default function AnalyticsPage() {
    const user = useAuthStore((s) => s.user);
    const authLoading = useAuthStore((s) => s.isLoading);
    const router = useRouter();
    const [timeRange, setTimeRange] = useState<TimeRange>("30d");

    // Fetch analytics stats
    const { data: stats, isLoading: statsLoading } = useQuery<AnalyticsStats>({
        queryKey: ["analytics-stats", timeRange],
        queryFn: () => fetcher(`/api/analytics/stats?timeRange=${timeRange}`),
        enabled: !!user,
    });

    // Fetch analytics timeline
    const { data: timeline, isLoading: timelineLoading } = useQuery<AnalyticsTimeline>({
        queryKey: ["analytics-timeline", timeRange],
        queryFn: () => {
            const groupBy = timeRange === "7d" ? "day" : timeRange === "90d" ? "week" : "day";
            return fetcher(`/api/analytics/timeline?timeRange=${timeRange}&groupBy=${groupBy}`);
        },
        enabled: !!user,
    });

    // Redirect if not authenticated
    if (!authLoading && !user) {
        router.push("/auth/login");
        return null;
    }

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Calculate top actions
    const topActions = stats?.breakdown
        ? Object.entries(stats.breakdown)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({
                name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                count,
            }))
        : [];

    return (
        <main className="p-6 md:p-8 lg:p-12 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
            >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white shadow-lg shadow-gray-900/20">
                                <span className="text-sm">📊</span>
                            </div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Performance Metrics</p>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">
                            Analytics
                        </h1>
                    </div>

                    <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
                </div>
            </motion.div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <StatsCard
                    title="Total Events"
                    value={stats?.totalEvents || 0}
                    icon="⚡"
                    loading={statsLoading}
                />
                <StatsCard
                    title="Most Common"
                    value={stats?.mostCommonEvent.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "None"}
                    icon="🎯"
                    loading={statsLoading}
                />
                <StatsCard
                    title="Event Types"
                    value={stats?.breakdown ? Object.keys(stats.breakdown).length : 0}
                    icon="📈"
                    loading={statsLoading}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <EventsChart
                    data={timeline?.timeline || []}
                    loading={timelineLoading}
                />
                <EventDistribution
                    data={stats?.breakdown || {}}
                    loading={statsLoading}
                />
            </div>

            {/* Top Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all"
            >
                <h3 className="text-2xl font-black text-gray-900 mb-6">Top Actions</h3>
                
                {topActions.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 font-bold">
                        No actions yet. Start using the app to see your activity!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {topActions.map((action, index) => {
                            const maxCount = topActions[0].count;
                            const percentage = (action.count / maxCount) * 100;
                            
                            return (
                                <motion.div
                                    key={action.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-gray-700">{action.name}</span>
                                        <span className="text-2xl font-black text-blue-600">{action.count}</span>
                                    </div>
                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                        />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </main>
    );
}
