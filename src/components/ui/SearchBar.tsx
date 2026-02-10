"use client";

import { motion, AnimatePresence } from "framer-motion";

type SearchBarProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
};

export default function SearchBar({ 
    value, 
    onChange, 
    placeholder = "Search...",
    className = ""
}: SearchBarProps) {
    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-6 py-4 pl-14 rounded-[2rem] bg-white border border-gray-100 focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 outline-none transition-all font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-medium"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                    🔍
                </div>
                <AnimatePresence>
                    {value && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => onChange("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all"
                        >
                            ×
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
