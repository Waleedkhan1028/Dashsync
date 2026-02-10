import { Workspace } from "@/types/database";

interface DashboardHeaderProps {
    workspace: Workspace | undefined;
    onCreateProject: () => void;
    isLoading?: boolean;
}

export function DashboardHeader({ workspace, onCreateProject, isLoading }: DashboardHeaderProps) {
    if (isLoading) {
        return (
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16 animate-pulse">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg sm:rounded-xl" />
                        <div className="w-24 h-4 bg-gray-200 rounded" />
                    </div>
                    <div className="w-48 sm:w-64 h-8 sm:h-10 bg-gray-200 rounded-xl" />
                </div>
            </header>
        );
    }

    return (
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-10 lg:mb-12">
            <div>
                <div className="flex items-center gap-3 mb-2 sm:mb-3">
                    <span className="bg-blue-600 text-white p-2 sm:p-2.5 rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center transform sm:scale-90 origin-left">🏢</span>
                    <span className="text-blue-600 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em]">Workspace</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight lowercase first-letter:uppercase">
                    {workspace ? workspace.name : "Pick a Workspace"}
                </h1>
            </div>
            {workspace && (
                <button
                    onClick={onCreateProject}
                    className="bg-gray-950 text-white px-6 sm:px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black shadow-premium hover:bg-gray-800 transition-all text-sm active:scale-95 flex items-center justify-center gap-3 w-full sm:w-auto group"
                >
                    <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span> Create New Project
                </button>
            )}
        </header>
    );
}
