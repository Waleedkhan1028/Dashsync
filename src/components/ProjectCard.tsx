"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

type ProjectCardProps = {
    id: string;
    name: string;
    taskCount?: number;
    onEdit?: () => void;
    onDelete?: () => void;
};

export default function ProjectCard({ id, name, taskCount = 0, onEdit, onDelete }: ProjectCardProps) {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="h-full relative"
        >
            <Link href={`/dashboard/projects/${id}`} className="block h-full no-underline">
                <div className="bg-white border border-gray-100 rounded-[2rem] p-8 h-full transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] flex flex-col group relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-100/50 transition-colors" />

                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                        📁
                    </div>

                    <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                        {name}
                    </h3>

                    <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
                            <span className="text-blue-400">📋</span>
                            <span>{taskCount} {taskCount === 1 ? 'task' : 'tasks'}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:border-blue-200 group-hover:text-blue-500 transition-all">
                            →
                        </div>
                    </div>
                </div>
            </Link>

            {/* Actions Menu */}
            {(onEdit || onDelete) && (
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-100 text-gray-400 hover:text-gray-900 transition-all font-black text-lg shadow-lg"
                    >
                        ⋮
                    </button>

                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowMenu(false);
                                }}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-20 min-w-[180px]"
                            >
                                {onEdit && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onEdit();
                                            setShowMenu(false);
                                        }}
                                        className="w-full px-6 py-4 text-left font-bold text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-3"
                                    >
                                        <span>✏️</span>
                                        <span>Edit Project</span>
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onDelete();
                                            setShowMenu(false);
                                        }}
                                        className="w-full px-6 py-4 text-left font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 border-t border-gray-100"
                                    >
                                        <span>🗑️</span>
                                        <span>Delete</span>
                                    </button>
                                )}
                            </motion.div>
                        </>
                    )}
                </div>
            )}
        </motion.div>
    );
}
