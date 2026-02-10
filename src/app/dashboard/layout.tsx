"use client";

import { ReactNode, Suspense } from "react";
import { useUIStore } from "../../stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Workspace } from "@/types/database";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

function DashboardLayoutContent({ children }: { children: ReactNode }) {
    const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);
    const toggleSidebar = useUIStore((s) => s.toggleSidebar);
    const user = useAuthStore((s) => s.user);
    const router = useRouter();
    const pathname = usePathname();
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

    return (
        <div className="flex min-h-screen bg-[#F9FAFB]"> {/* Cleaner background hex */}
            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {isSidebarOpen && (
                    <motion.aside
                        initial={{ x: -260 }}
                        animate={{ x: 0 }}
                        exit={{ x: -260 }}
                        transition={{ type: "spring", damping: 24, stiffness: 180 }} /* Snappier animation */
                        className="w-[250px] bg-gray-900 text-white flex flex-col border-r border-gray-800/50 z-30 shadow-2xl"
                    >
                        <div className="p-4 border-b border-gray-800/50 flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                                D
                            </div>
                            <h2 className="text-sm font-bold tracking-tight text-white">
                                DashSync
                            </h2>
                        </div>

                        <div className="p-3 flex-1 overflow-y-auto">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2 mt-2">
                                Workspaces
                            </p>
                            <ul className="flex flex-col gap-0.5 list-none p-0">
                                {workspaces?.map((ws) => (
                                    <li key={ws.id}>
                                        <button
                                            onClick={() => handleWorkspaceChange(ws.id)}
                                            className={`w-full text-left px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-200 flex items-center gap-3 ${selectedWorkspaceId === ws.id
                                                ? "bg-gray-800 text-white shadow-sm ring-1 ring-white/10"
                                                : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                                                }`}
                                        >
                                            <span className="text-gray-500">#</span>
                                            <span className="truncate">{ws.name}</span>
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
                                        className="w-full text-left px-3 py-2 rounded-md text-[12px] font-medium text-gray-500 border border-dashed border-gray-700/50 mt-3 hover:bg-gray-800/50 hover:text-gray-300 transition-all duration-200 flex items-center gap-2 group"
                                    >
                                        <span className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center text-[10px] group-hover:border-gray-400">+</span>
                                        Add Workspace
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <nav className="p-3 border-t border-gray-800/50">
                            <ul className="flex flex-col gap-0.5 list-none p-0">
                                <li onClick={() => router.push("/dashboard/analytics")} className="text-gray-400 text-[13px] font-medium px-3 py-2 hover:bg-gray-800/50 hover:text-white rounded-md cursor-pointer transition-colors flex items-center gap-3">
                                    <span className="opacity-70">📊</span> Analytics
                                </li>
                                <li className="text-gray-400 text-[13px] font-medium px-3 py-2 hover:bg-gray-800/50 hover:text-white rounded-md cursor-pointer transition-colors flex items-center gap-3">
                                    <span className="opacity-70">⚙️</span> Settings
                                </li>
                            </ul>
                            <div className="mt-4 pt-4 border-t border-gray-800/50 px-2 flex items-center gap-3">
                                {user ? (
                                    <>
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold ring-2 ring-gray-950">
                                            {user.email?.[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-medium text-white truncate">
                                                {user.user_metadata?.full_name || "User"}
                                            </p>
                                            <p className="text-[11px] text-gray-500 truncate">
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
                <header className="h-14 border-b border-gray-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            {isSidebarOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                            )}
                        </button>
                        
                        {/* Breadcrumb or Page Title area could go here */}
                    </div>

                    <div className="flex items-center gap-3">
                         <button
                            onClick={() => useAuthStore.getState().signOut()}
                            className="text-[12px] font-medium text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-md hover:bg-red-50"
                        >
                            Sign out
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
