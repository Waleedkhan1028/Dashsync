"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type EmptyStateProps = {
    icon?: string;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
};

export default function EmptyState({ 
    icon = "📭", 
    title, 
    description,
    action,
    className = ""
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center py-24 px-10 bg-white rounded-[3rem] border border-gray-100 shadow-sm ${className}`}
        >
            <div className="text-6xl mb-8">{icon}</div>
            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">{title}</h3>
            {description && (
                <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium text-lg leading-relaxed">
                    {description}
                </p>
            )}
            {action && <div>{action}</div>}
        </motion.div>
    );
}
