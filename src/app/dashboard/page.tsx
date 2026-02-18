"use client";

// ─── React & Next ─────────────────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

// ─── Stores & Hooks ───────────────────────────────────────────────────────────
import { useAuthStore } from "@/stores/auth.store";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useProjects } from "@/hooks/useProjects";
import { useDebounce } from "@/hooks/useDebounce";

// ─── Types ────────────────────────────────────────────────────────────────────
import { Project } from "@/types/database";

// ─── UI Components ────────────────────────────────────────────────────────────
import SearchBar from "@/components/ui/SearchBar";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProjectList } from "@/components/dashboard/ProjectList";
import { CreateWorkspaceModal } from "@/components/dashboard/modals/CreateWorkspaceModal";
import { CreateProjectModal } from "@/components/dashboard/modals/CreateProjectModal";
import { EditProjectModal } from "@/components/dashboard/modals/EditProjectModal";

// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    // ── Router & URL params ──────────────────────────────────────────────────
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedWorkspaceId = searchParams.get("workspaceId");
    const showNewWsModal      = searchParams.get("newWorkspace") === "true";
    const deleteWorkspaceId   = searchParams.get("deleteWorkspaceId"); // set by sidebar trash icon

    // ── Local state ──────────────────────────────────────────────────────────
    const [isWsModalOpen,      setIsWsModalOpen]      = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [searchQuery,        setSearchQuery]        = useState("");
    const [editingProject,     setEditingProject]     = useState<Project | null>(null);
    const [deletingProject,    setDeletingProject]    = useState<Project | null>(null);

    const debouncedSearch = useDebounce(searchQuery, 300);

    // ── Data hooks ───────────────────────────────────────────────────────────
    const authLoading = useAuthStore((s) => s.isLoading);

    const {
        workspaces,
        isLoading: isLoadingWs,
        error:     wsError,
        createWorkspace,
        deleteWorkspace,
        isDeleting: isDeletingWs,
        isCreating: isCreatingWs,
        createError: createWsError,
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
        updateError: updateProjError,
    } = useProjects(selectedWorkspaceId);

    // ── Derived values ───────────────────────────────────────────────────────
    const isPageLoading    = authLoading || isLoadingWs;
    const currentWorkspace = workspaces?.find((w) => w.id === selectedWorkspaceId);
    const workspaceToDelete = workspaces?.find((w) => w.id === deleteWorkspaceId);

    const filteredProjects = useMemo(() => {
        if (!projects) return [];
        if (!debouncedSearch.trim()) return projects;
        return projects.filter((p) =>
            p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
    }, [projects, debouncedSearch]);

    // ── URL helpers ──────────────────────────────────────────────────────────
    /** Returns a new URLSearchParams with the given keys deleted. */
    const buildParams = (...keysToDelete: string[]) => {
        const params = new URLSearchParams(searchParams.toString());
        keysToDelete.forEach((k) => params.delete(k));
        return params;
    };

    // ── Workspace handlers ───────────────────────────────────────────────────
    const handleCreateWorkspace = async (workspaceName: string) => {
        const newWs = await createWorkspace(workspaceName);
        setIsWsModalOpen(false);
        const params = new URLSearchParams(searchParams.toString());
        params.set("workspaceId", newWs.id);
        params.delete("newWorkspace");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleDeleteWorkspace = async () => {
        if (!workspaceToDelete) return;
        await deleteWorkspace(workspaceToDelete.id);
        router.push(`${pathname}?${buildParams("workspaceId", "deleteWorkspaceId").toString()}`);
    };

    const closeWsModal = () =>
        router.push(`${pathname}?${buildParams("newWorkspace").toString()}`);

    const closeDeleteWsModal = () =>
        router.push(`${pathname}?${buildParams("deleteWorkspaceId").toString()}`);

    // ── Project handlers ─────────────────────────────────────────────────────
    const handleCreateProject = async (projectName: string) => {
        await createProject({ projectName });
        setIsProjectModalOpen(false);
    };

    const handleUpdateProject = async (id: string, projectName: string) => {
        await updateProject({ id, projectName });
        setEditingProject(null);
    };

    const handleDeleteProject = async () => {
        if (!deletingProject) return;
        await deleteProject(deletingProject.id);
        setDeletingProject(null);
    };

    // ── Early returns ────────────────────────────────────────────────────────
    if (wsError) {
        return (
            <div className="p-10 text-center flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] max-w-xl mx-auto">
                <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-sm">⚠️</div>
                <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Failed to load workspaces</h2>
                <p className="text-gray-600 mb-8 leading-relaxed font-medium">
                    {(wsError as Error).message || "An unexpected error occurred. Please check your connection or try again."}
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
                    <button
                        onClick={() => setIsWsModalOpen(true)}
                        className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] text-xl font-black shadow-2xl shadow-blue-500/30 hover:scale-[1.03] active:scale-[0.97] transition-all"
                    >
                        Create My First Workspace
                    </button>
                </motion.div>

                <AnimatePresence>
                    <CreateWorkspaceModal
                        isOpen={isWsModalOpen || showNewWsModal}
                        onClose={closeWsModal}
                        onSubmit={handleCreateWorkspace}
                        isLoading={isCreatingWs}
                        error={createWsError}
                    />
                </AnimatePresence>
            </div>
        );
    }

    // ── Main render ──────────────────────────────────────────────────────────
    return (
        <div className="p-4 sm:p-6 lg:p-12 max-w-7xl mx-auto min-h-full">
            <DashboardHeader
                workspace={currentWorkspace}
                onCreateProject={() => setIsProjectModalOpen(true)}
                isLoading={isPageLoading}
            />

            {selectedWorkspaceId || isPageLoading ? (
                <div className="space-y-6 lg:space-y-10 mt-6 lg:mt-8">
                    {(isPageLoading || (projects && projects.length > 0)) && (
                        <div className="w-full">
                            <SearchBar
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder="Search projects by name..."
                                className="max-w-full lg:max-w-2xl"
                            />
                        </div>
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
                <div className="text-center py-20 sm:py-32 px-6 sm:px-10 rounded-2xl sm:rounded-[3rem] bg-gray-50/50 border-2 sm:border-4 border-dashed border-gray-200/50 mt-6">
                    <div className="text-6xl sm:text-8xl mb-6 sm:mb-10 opacity-20 grayscale">📂</div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-300 tracking-tight px-4">Select a workspace from the sidebar</h2>
                    <p className="text-gray-400 mt-3 sm:mt-4 font-bold text-xs sm:text-sm uppercase tracking-widest">Awaiting interaction</p>
                </div>
            )}

            {/* Modals */}
            <AnimatePresence>
                <CreateWorkspaceModal
                    isOpen={isWsModalOpen || showNewWsModal}
                    onClose={closeWsModal}
                    onSubmit={handleCreateWorkspace}
                    isLoading={isCreatingWs}
                    error={createWsError}
                />

                <CreateProjectModal
                    isOpen={isProjectModalOpen}
                    onClose={() => setIsProjectModalOpen(false)}
                    onSubmit={handleCreateProject}
                    isLoading={isCreatingProj}
                    error={createProjError}
                    workspaceName={currentWorkspace?.name}
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

                {workspaceToDelete && (
                    <DeleteConfirmationModal
                        isOpen={true}
                        onClose={closeDeleteWsModal}
                        onConfirm={handleDeleteWorkspace}
                        title="Delete Workspace"
                        itemName={workspaceToDelete.name}
                        itemType="workspace"
                        isDeleting={isDeletingWs}
                        cascadeWarning="All projects and tasks inside this workspace will also be permanently deleted."
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
