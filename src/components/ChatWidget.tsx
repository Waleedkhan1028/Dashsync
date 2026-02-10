"use client";

import { useState } from "react";
import ProjectChat from "@/components/ProjectChat";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatWidget({ projectId }: { projectId: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="mb-4 pointer-events-auto shadow-2xl shadow-blue-900/20 rounded-2xl sm:rounded-[2.5rem] overflow-hidden max-w-[calc(100vw-2rem)] sm:max-w-none"
                    >
                        <div className="w-[calc(100vw-2rem)] sm:w-[380px] h-[450px] sm:h-[500px] bg-white">
                            <ProjectChat projectId={projectId} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                layout
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`pointer-events-auto h-12 sm:h-14 px-4 sm:px-6 rounded-full font-bold shadow-xl flex items-center gap-2 sm:gap-3 transition-colors text-sm sm:text-base ${
                    isOpen 
                        ? "bg-gray-900 text-white" 
                        : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
            >
                <span className="text-lg sm:text-xl">{isOpen ? "×" : "💬"}</span>
                <span className="text-xs sm:text-sm">{isOpen ? "Close" : "Chat"}</span>
            </motion.button>
        </div>
    );
}
