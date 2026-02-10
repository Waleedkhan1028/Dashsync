"use client";

import { motion } from "framer-motion";

type StatsCardProps = {
    title: string;
    value: string | number;
    icon: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    loading?: boolean;
};

export default function StatsCard({ title, value, icon, trend, loading = false }: StatsCardProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-[2.5rem] p-8 border-2 border-gray-100 animate-pulse">
                <div className="h-6 w-24 bg-gray-200 rounded mb-4" />
                <div className="h-12 w-32 bg-gray-200 rounded" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
                {trend && (
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide ${
                        trend.isPositive 
                            ? 'bg-green-50 text-green-600' 
                            : 'bg-red-50 text-red-600'
                    }`}>
                        {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                    </div>
                )}
            </div>
            
            <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-1">
                {title}
            </h3>
            
            <p className="text-3xl font-black text-gray-900 tracking-tight">
                {value.toLocaleString()}
            </p>
        </motion.div>
    );
}
