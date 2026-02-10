"use client";

import { useTasks } from "../../hooks/useTasks";
import { motion } from "framer-motion";

export default function TaskBoard({ projectId }: { projectId: string }) {
    const { data, isLoading } = useTasks(projectId);

    if (isLoading) {
        return (
            <div className="flex gap-6 overflow-x-auto pb-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="min-w-[300px] h-96 bg-gray-50 rounded-[2rem] animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="flex gap-8 overflow-x-auto pb-8 snap-x">
            {["todo", "in-progress", "done"].map((status) => (
                <div key={status} className="min-w-[320px] bg-gray-50/50 rounded-[2.5rem] p-6 border border-gray-100 flex flex-col gap-6 snap-center">
                    <header className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${status === "done" ? "bg-green-500" : status === "in-progress" ? "bg-yellow-500" : "bg-blue-500"
                                }`} />
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">{status}</h3>
                        </div>
                        <span className="text-gray-400 font-bold text-xs bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-100">
                            {data?.filter(t => t.status === status).length || 0}
                        </span>
                    </header>

                    <div className="flex flex-col gap-4">
                        {data
                            ?.filter((task) => task.status === status)
                            .map((task, idx) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ y: -2, scale: 1.02 }}
                                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-900/5 transition-all cursor-pointer group"
                                >
                                    <h4 className="font-bold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">{task.title}</h4>
                                    <div className="mt-4 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 border border-white -ml-1 flex items-center justify-center text-[10px] font-black first:ml-0">
                                            👤
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                        <button className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-bold text-sm uppercase tracking-widest hover:border-blue-200 hover:text-blue-500 transition-all active:scale-[0.98]">
                            + New Task
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
