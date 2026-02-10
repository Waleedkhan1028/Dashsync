"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type ModalProps = {
    title: string;
    children: ReactNode;
    onClose: () => void;
    isOpen?: boolean;
    size?: "sm" | "md" | "lg";
};

export default function Modal({ 
    title, 
    children, 
    onClose, 
    isOpen = true,
    size = "md" 
}: ModalProps) {
    const sizeClasses = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl"
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-gray-950/40 backdrop-blur-md"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={`bg-white p-10 rounded-[3rem] w-full ${sizeClasses[size]} shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] relative overflow-hidden`}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter">{title}</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all text-2xl"
                    >
                        ×
                    </button>
                </div>
                <div className="relative z-10">{children}</div>

                {/* Subtle decoration */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50/50 rounded-full blur-3xl" />
            </motion.div>
        </div>
    );
}
