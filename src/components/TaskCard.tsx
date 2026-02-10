"use client";

import { motion } from "framer-motion";
import { Task } from "@/types/database";
import { useState } from "react";

type TaskCardProps = {
    task: Task;
    index: number;
    onEdit?: (task: Task) => void;
    onDelete?: (task: Task) => void;
    onStatusChange?: (task: Task) => void;
};

export default function TaskCard({ 
    task, 
    index, 
    onEdit, 
    onDelete,
    onStatusChange 
}: TaskCardProps) {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <motion.div
            key={task.id}
            layoutId={task.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`group p-8 bg-white rounded-[2.5rem] border-2 transition-all flex items-center justify-between relative
                ${showMenu ? "z-50" : "z-0"}
                ${task.status === "done" 
                    ? "border-green-100/50 bg-green-50/10" 
                    : "border-transparent shadow-xl shadow-gray-200/40 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-500/10"
                }
            `}
        >
            <div className="flex items-center gap-6">
                <div className={`
                    relative w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl font-black transition-colors
                    ${task.status === "done" ? "bg-green-100 text-green-500" : "bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white"}
                `}>
                    <span className="relative z-10">{index + 1}</span>
                    {task.status !== "done" && (
                        <div className="absolute inset-0 bg-blue-500 rounded-[1.5rem] opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300" />
                    )}
                </div>
                
                <div className="flex flex-col gap-1">
                    <span className={`text-xl font-black tracking-tight text-gray-900 transition-colors ${
                        task.status === "done" ? "line-through opacity-40" : "group-hover:text-blue-900"
                    }`}>
                        {task.title}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            ID: {task.id.slice(0, 4)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className={`
                    px-6 py-3 rounded-2xl text-[10px] uppercase font-black tracking-widest border transition-colors
                    ${task.status === "done" 
                        ? "bg-green-100 text-green-600 border-green-200" 
                        : "bg-white text-gray-500 border-gray-100 group-hover:border-blue-200 group-hover:text-blue-600"
                    }
                `}>
                    {task.status}
                </div>
                
                {(onEdit || onDelete) && (
                    <div className="relative">
                        <button 
                            onClick={() => setShowMenu(!showMenu)}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-gray-100 text-gray-300 hover:text-gray-900 transition-all font-black text-xl"
                        >
                            ⋮
                        </button>
                        
                        {showMenu && (
                            <>
                                <div 
                                    className="fixed inset-0 z-10" 
                                    onClick={() => setShowMenu(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-20 min-w-[180px]"
                                >
                                    {onEdit && (
                                        <button
                                            onClick={() => {
                                                onEdit(task);
                                                setShowMenu(false);
                                            }}
                                            className="w-full px-6 py-4 text-left font-bold text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-3"
                                        >
                                            <span>✏️</span>
                                            <span>Edit Task</span>
                                        </button>
                                    )}
                                    {onStatusChange && (
                                        <button
                                            onClick={() => {
                                                onStatusChange(task);
                                                setShowMenu(false);
                                            }}
                                            className="w-full px-6 py-4 text-left font-bold text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-3"
                                        >
                                            <span>{task.status === "done" ? "↩️" : "✅"}</span>
                                            <span>Mark as {task.status === "done" ? "Todo" : "Done"}</span>
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => {
                                                onDelete(task);
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
            </div>
        </motion.div>
    );
}
