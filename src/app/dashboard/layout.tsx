"use client";

import { ReactNode, Suspense } from "react";
import { useUIStore } from "../../stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Workspace } from "@/types/database";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

function DashboardLayoutContent({
    children,
}: {
    children: ReactNode;
}) {
    const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);
    const toggleSidebar = useUIStore((s) => s.toggleSidebar);
    const user = useAuthStore((s) => s.user);
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedWorkspaceId = searchParams.get("workspaceId");

    const { data: workspaces } = useQuery({
        queryKey: ["workspaces"],
        queryFn: () => fetcher<Workspace[]>("/api/workspaces"),
        enabled: !!user,
    });

    const handleWorkspaceChange = (id: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (id) {
            params.set("workspaceId", id);
        } else {
            params.delete("workspaceId");
        }
        router.push(`/dashboard?${params.toString()}`);
    };

    // Signals the dashboard page to open the delete confirmation modal
    const handleDeleteWorkspaceClick = (wsId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("deleteWorkspaceId", wsId);
        router.push(`/dashboard?${params.toString()}`);
    };

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            {/* Mobile Backdrop Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleSidebar}
                        className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {isSidebarOpen && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: "spring", damping: 28, stiffness: 200 }}
                        className="fixed lg:relative w-[280px] h-screen bg-gray-950 text-white flex flex-col border-r border-white/5 z-50 shadow-2xl"
                    >
                        <div className="p-6 border-b border-white/5 flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20">
                                D
                            </div>
                            <h2 className="text-lg font-black tracking-tight text-white font-sans">
                                DashSync
                            </h2>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 px-3 mt-2">
                                Workspaces
                            </p>
                            <ul className="flex flex-col gap-1 list-none p-0">
                                {workspaces?.map((ws) => (
                                    <li key={ws.id} className="group/ws relative">
                                        <button
                                            onClick={() => handleWorkspaceChange(ws.id)}
                                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-3 pr-10 ${selectedWorkspaceId === ws.id
                                                ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
                                                : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                                                }`}
                                        >
                                            <span className="text-gray-600 font-black">#</span>
                                            <span className="truncate">{ws.name}</span>
                                        </button>

                                        {/* Delete button — hover-reveal on desktop, always visible on mobile */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteWorkspaceClick(ws.id);
                                            }}
                                            title={`Delete "${ws.name}"`}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 active:bg-red-500/20 active:text-red-400 transition-all opacity-0 group-hover/ws:opacity-100 focus:opacity-100 [@media(hover:none)]:opacity-40 [@media(hover:none)]:group-hover/ws:opacity-100"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                <path d="M10 11v6M14 11v6" />
                                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                            </svg>
                                        </button>
                                    </li>
                                ))}
                                <li>
                                    <button
                                        onClick={() => {
                                            const params = new URLSearchParams(searchParams.toString());
                                            params.set("newWorkspace", "true");
                                            router.push(`/dashboard?${params.toString()}`);
                                        }}
                                        className="w-full text-left px-4 py-3 rounded-xl text-[12px] font-bold text-gray-500 border border-dashed border-white/10 mt-4 hover:bg-white/5 hover:text-gray-300 transition-all duration-200 flex items-center gap-2 group"
                                    >
                                        <span className="w-5 h-5 rounded-full border border-gray-700 flex items-center justify-center text-xs group-hover:border-gray-500">+</span>
                                        Add Workspace
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <nav className="p-4 border-t border-white/5">
                            <ul className="flex flex-col gap-1 list-none p-0">
                                <li onClick={() => router.push("/dashboard/analytics")} className="text-gray-400 text-sm font-bold px-4 py-3 hover:bg-white/5 hover:text-white rounded-xl cursor-pointer transition-colors flex items-center gap-3">
                                    <span className="opacity-70 text-lg">📊</span> Analytics
                                </li>
                                <li className="text-gray-400 text-sm font-bold px-4 py-3 hover:bg-white/5 hover:text-white rounded-xl cursor-pointer transition-colors flex items-center gap-3">
                                    <span className="opacity-70 text-lg">⚙️</span> Settings
                                </li>
                            </ul>
                            <div className="mt-6 pt-6 border-t border-white/5 px-2 flex items-center gap-4">
                                {user ? (
                                    <>
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-black ring-2 ring-gray-950 shadow-lg">
                                            {user.email?.[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-white truncate">
                                                {user.user_metadata?.full_name || "User"}
                                            </p>
                                            <p className="text-[11px] font-bold text-gray-500 truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        </nav>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
                {/* Header */}
                <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 lg:px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 -ml-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all font-black"
                        >
                            {isSidebarOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                            )}
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                         <button
                            onClick={() => useAuthStore.getState().signOut()}
                            className="text-xs font-black text-gray-400 hover:text-red-500 transition-all px-4 py-2 rounded-xl hover:bg-red-50 uppercase tracking-widest"
                        >
                            Log Out
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-[#FAFAFA] text-gray-900">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>}>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </Suspense>
    );
}


