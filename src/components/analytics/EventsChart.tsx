"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type EventsChartProps = {
    data: Array<{ timestamp: string; total: number; [key: string]: unknown }>;
    loading?: boolean;
};

export default function EventsChart({ data, loading = false }: EventsChartProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-[2.5rem] p-8 border-2 border-gray-100 animate-pulse">
                <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
                <div className="h-64 bg-gray-100 rounded-xl" />
            </div>
        );
    }

    // Format data for chart
    const chartData = data.map(item => ({
        ...item,
        date: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));

    return (
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Activity Timeline
            </h3>
            
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="date" 
                        stroke="#9ca3af"
                        style={{ fontSize: '12px', fontWeight: '600' }}
                    />
                    <YAxis 
                        stroke="#9ca3af"
                        style={{ fontSize: '12px', fontWeight: '600' }}
                    />
                    <Tooltip 
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '2px solid #e5e7eb',
                            borderRadius: '16px',
                            padding: '12px',
                            fontWeight: '600',
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fill="url(#colorTotal)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
