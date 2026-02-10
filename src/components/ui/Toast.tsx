"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

type ToastProps = {
    message: string;
    type?: ToastType;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
};

export default function Toast({ 
    message, 
    type = "info", 
    isVisible, 
    onClose, 
    duration = 4000 
}: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    const bgColors = {
        success: "bg-green-600",
        error: "bg-red-600",
        info: "bg-blue-600"
    };

    const icons = {
        success: "✅",
        error: "⚠️",
        info: "ℹ️"
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed bottom-8 right-8 z-[200]">
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className={`${bgColors[type]} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px] border border-white/10 backdrop-blur-md`}
                    >
                        <span className="text-xl">{icons[type]}</span>
                        <div className="flex-1">
                            <p className="font-bold text-sm tracking-wide">{message}</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            ✕
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
