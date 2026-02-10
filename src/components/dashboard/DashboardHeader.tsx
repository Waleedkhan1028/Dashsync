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
                        <div className="w-8 h-8 bg-gray-200 rounded-xl" />
                        <div className="w-24 h-4 bg-gray-200 rounded" />
                    </div>
                    <div className="w-48 sm:w-64 h-8 sm:h-10 bg-gray-200 rounded-lg" />
                </div>
            </header>
        );
    }

    return (
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16">
            <div>
                <div className="flex items-center gap-3 mb-2 sm:mb-3">
                    <span className="bg-blue-600 text-white p-1.5 sm:p-2 rounded-lg sm:rounded-xl scale-75 origin-left shadow-lg">🏢</span>
                    <span className="text-blue-600 font-bold text-[10px] sm:text-xs uppercase tracking-widest">Workspace</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight lowercase first-letter:uppercase">
                    {workspace ? workspace.name : "Pick a Workspace"}
                </h1>
            </div>
            {workspace && (
                <button
                    onClick={onCreateProject}
                    className="bg-gray-950 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black shadow-2xl hover:bg-gray-800 transition-all text-sm active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    <span className="text-lg">+</span> Create New Project
                </button>
            )}
        </header>
    );
}
