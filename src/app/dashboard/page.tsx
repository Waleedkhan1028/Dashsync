"use client";

import { useAuthStore } from "@/stores/auth.store";
import { Project } from "@/types/database";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Modal from "@/components/ui/Modal";
import SearchBar from "@/components/ui/SearchBar";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import { useDebounce } from "@/hooks/useDebounce";

import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useProjects } from "@/hooks/useProjects";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProjectList } from "@/components/dashboard/ProjectList";
import { CreateWorkspaceModal } from "@/components/dashboard/modals/CreateWorkspaceModal";
import { CreateProjectModal } from "@/components/dashboard/modals/CreateProjectModal";
import { EditProjectModal } from "@/components/dashboard/modals/EditProjectModal";

export default function DashboardPage() {
    const user = useAuthStore((s) => s.user);
    const authLoading = useAuthStore((s) => s.isLoading);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [isWsModalOpen, setIsWsModalOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [deletingProject, setDeletingProject] = useState<Project | null>(null);

    const debouncedSearch = useDebounce(searchQuery, 300);

    const selectedWorkspaceId = searchParams.get("workspaceId");
    const showNewWsModal = searchParams.get("newWorkspace") === "true";

    // Hooks
    const { 
        workspaces, 
        isLoading: isLoadingWs, 
        error: wsError,
        createWorkspace,
        isCreating: isCreatingWs,
        createError: createWsError
    } = useWorkspaces();

    const { 
        projects, 
        isLoading: isLoadingProj, 
        createProject,
        updateProject,
        deleteProject,
        isCreating: isCreatingProj,
        isUpdating: isUpdatingProj,
        isDeleting: isDeletingProj,
        createError: createProjError,
        updateError: updateProjError
    } = useProjects(selectedWorkspaceId);

    const currentWorkspace = workspaces?.find(w => w.id === selectedWorkspaceId);

    useEffect(() => {
        if (showNewWsModal) setIsWsModalOpen(true);
    }, [showNewWsModal]);

    // Filter projects based on search
    const filteredProjects = useMemo(() => {
        if (!projects) return [];
        if (!debouncedSearch.trim()) return projects;
        return projects.filter(p => 
            p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
    }, [projects, debouncedSearch]);

    const handleCreateWorkspace = async (workspaceName: string) => {
        const newWs = await createWorkspace(workspaceName);
        setIsWsModalOpen(false);
        const params = new URLSearchParams(searchParams.toString());
        params.set("workspaceId", newWs.id);
        params.delete("newWorkspace");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleCreateProject = async (projectName: string) => {
        await createProject({ projectName });
        setIsProjectModalOpen(false);
    };

    const handleUpdateProject = async (id: string, projectName: string) => {
        await updateProject({ id, projectName });
        setEditingProject(null);
    };

    const handleDeleteProject = async () => {
        if (deletingProject) {
            await deleteProject(deletingProject.id);
            setDeletingProject(null);
        }
    };

    const closeWsModal = () => {
        setIsWsModalOpen(false);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("newWorkspace");
        router.push(`${pathname}?${params.toString()}`);
    };

    // Non-blocking loading state (optional: you could keep a small top loader)
    const isPageLoading = authLoading || isLoadingWs;

    if (wsError) {
        return (
            <div className="p-10 text-center flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] max-w-xl mx-auto">
                <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-sm">⚠️</div>
                <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Failed to load workspaces</h2>
                <p className="text-gray-600 mb-8 leading-relaxed font-medium">
                    {(wsError as any).message || "An unexpected error occurred. Please check your connection or try again."}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!isPageLoading && (!workspaces || workspaces.length === 0)) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-tr from-gray-50 to-blue-50/50 p-8">
                {/* ... existing empty state content ... */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-lg"
                >
                    <div className="text-8xl mb-10 drop-shadow-2xl">🚀</div>
                    <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">
                        Empower Your Workflow
                    </h1>
                    <p className="text-xl text-gray-600 mb-10 leading-relaxed font-medium">
                        Welcome to DashSync. Create your first workspace to start collaborating and managing projects with premium clarity.
                    </p>
                    {/* ... */}
                    <button
                        onClick={() => setIsWsModalOpen(true)}
                        className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] text-xl font-black shadow-2xl shadow-blue-500/30 hover:scale-[1.03] active:scale-[0.97] transition-all"
                    >
                        Create My First Workspace
                    </button>
                </motion.div>

                <AnimatePresence>
                    <CreateWorkspaceModal
                        isOpen={isWsModalOpen}
                        onClose={closeWsModal}
                        onSubmit={handleCreateWorkspace}
                        isLoading={isCreatingWs}
                        error={createWsError}
                    />
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto min-h-full">
            <DashboardHeader 
                workspace={currentWorkspace} 
                onCreateProject={() => setIsProjectModalOpen(true)} 
                isLoading={isPageLoading}
            />

            {selectedWorkspaceId || isPageLoading ? (
                <div className="space-y-10">
                    {/* Search Bar */}
                    {(isPageLoading || (projects && projects.length > 0)) && (
                        <SearchBar 
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search projects by name..."
                            className="max-w-2xl"
                        />
                    )}

                    <ProjectList 
                        projects={filteredProjects}
                        isLoading={isLoadingProj || (isPageLoading && !projects)}
                        searchQuery={searchQuery}
                        onEdit={setEditingProject}
                        onDelete={setDeletingProject}
                        onCreateFirst={() => setIsProjectModalOpen(true)}
                        onClearSearch={() => setSearchQuery("")}
                    />
                </div>
            ) : (
                <div className="text-center py-32 px-10 rounded-[3rem] bg-gray-50/50 border-4 border-dashed border-gray-200/50">
                    <div className="text-8xl mb-10 opacity-20 grayscale">📂</div>
                    <h2 className="text-2xl font-black text-gray-300 tracking-tight">Select a workspace from the sidebar</h2>
                    <p className="text-gray-400 mt-4 font-bold text-sm uppercase tracking-widest">Awaiting interaction</p>
                </div>
            )}
            
            {/* Modals ... */}

            {/* Modals */}
            <AnimatePresence>
                <CreateProjectModal
                    isOpen={isProjectModalOpen}
                    onClose={() => setIsProjectModalOpen(false)}
                    onSubmit={handleCreateProject}
                    isLoading={isCreatingProj}
                    error={createProjError}
                    workspaceName={currentWorkspace?.name}
                />

                <CreateWorkspaceModal
                    isOpen={isWsModalOpen}
                    onClose={closeWsModal}
                    onSubmit={handleCreateWorkspace}
                    isLoading={isCreatingWs}
                    error={createWsError}
                />

                <EditProjectModal
                    project={editingProject}
                    onClose={() => setEditingProject(null)}
                    onSubmit={handleUpdateProject}
                    isLoading={isUpdatingProj}
                    error={updateProjError}
                />

                {deletingProject && (
                    <DeleteConfirmationModal
                        isOpen={true}
                        onClose={() => setDeletingProject(null)}
                        onConfirm={handleDeleteProject}
                        title="Delete Project"
                        itemName={deletingProject.name}
                        itemType="project"
                        isDeleting={isDeletingProj}
                        cascadeWarning="All tasks within this project will also be deleted."
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
