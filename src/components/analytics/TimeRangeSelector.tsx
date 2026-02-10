"use client";

import { motion } from "framer-motion";

type TimeRange = "7d" | "30d" | "90d" | "all";

type TimeRangeSelectorProps = {
    value: TimeRange;
    onChange: (range: TimeRange) => void;
};

const ranges: { label: string; value: TimeRange }[] = [
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
    { label: "90 Days", value: "90d" },
    { label: "All Time", value: "all" },
];

export default function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
    return (
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200/50">
            {ranges.map((range) => {
                const isActive = value === range.value;
                return (
                    <button
                        key={range.value}
                        onClick={() => onChange(range.value)}
                        className={`relative px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 z-0 ${
                            isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeRange"
                                className="absolute inset-0 bg-white rounded-xl shadow-sm border border-black/5 z-[-1]"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10">{range.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

export type { TimeRange };
