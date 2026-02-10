"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type EventDistributionProps = {
    data: Record<string, number>;
    loading?: boolean;
};

const COLORS = {
    'user_signup': '#10b981',
    'user_login': '#3b82f6',
    'workspace_created': '#8b5cf6',
    'project_created': '#f59e0b',
    'project_updated': '#fbbf24',
    'project_deleted': '#ef4444',
    'task_created': '#06b6d4',
    'task_updated': '#14b8a6',
    'task_deleted': '#f97316',
    'task_status_changed': '#ec4899',
};

export default function EventDistribution({ data, loading = false }: EventDistributionProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-[2.5rem] p-8 border-2 border-gray-100 animate-pulse">
                <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
                <div className="h-64 bg-gray-100 rounded-full mx-auto w-64" />
            </div>
        );
    }

    // Convert data to chart format
    const chartData = Object.entries(data).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value,
        color: COLORS[name as keyof typeof COLORS] || '#6b7280',
    }));

    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Event Distribution
            </h3>
            
            <div className="flex flex-col md:flex-row items-center gap-8">
            {chartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-400 font-bold">
                    No events yet
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '2px solid #e5e7eb',
                                borderRadius: '16px',
                                padding: '12px',
                                fontWeight: '600',
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            )}
            
            <div className="mt-6 text-center">
                <p className="text-3xl font-black text-gray-900">{total}</p>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Events</p>
            </div>
            </div>
        </div>
    );
}
