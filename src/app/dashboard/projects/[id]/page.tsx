"use client";

import { useAuthStore } from "@/stores/auth.store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Project, Task } from "@/types/database";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatWidget from "@/components/chat/ChatWidget";
import TaskCard from "@/components/tasks/TaskCard";
import SearchBar from "@/components/ui/SearchBar";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import Toast from "@/components/ui/Toast";
import { useDebounce } from "@/hooks/useDebounce";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { trackEvent } from "@/lib/analytics";

const taskSchema = yup.object({
    title: yup.string().required("Task title is required"),
});

export default function ProjectPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;
    const user = useAuthStore((s) => s.user);
    const queryClient = useQueryClient();

    const [isCreatingTask, setIsCreatingTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deletingTask, setDeletingTask] = useState<Task | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; isVisible: boolean }>({
        message: "",
        type: "info",
        isVisible: false
    });

    const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
        setToast({ message, type, isVisible: true });
    };

    const debouncedSearch = useDebounce(searchQuery, 300);

    // 1. Fetch Project Details
    const { data: project, isLoading: loadingProject } = useQuery({
        queryKey: ["project", projectId],
        queryFn: () => fetcher<Project>(`/api/projects/${projectId}`),
        enabled: !!projectId,
    });

    // 2. Fetch Tasks
    const { data: tasks, isLoading: loadingTasks } = useQuery({
        queryKey: ["tasks", projectId],
        queryFn: () => fetcher<Task[]>(`/api/projects/${projectId}/tasks`),
        enabled: !!projectId,
    });

    // Filter tasks based on search
    const filteredTasks = useMemo(() => {
        if (!tasks) return [];
        if (!debouncedSearch.trim()) return tasks;
        return tasks.filter(t => 
            t.title.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
    }, [tasks, debouncedSearch]);

    // 3. Create Task Mutation
    const createTaskMutation = useMutation({
        mutationFn: (title: string) => fetcher<Task>(`/api/projects/${projectId}/tasks`, {
            method: "POST",
            body: JSON.stringify({ title, status: "todo" }),
        }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
            setIsCreatingTask(false);
            setNewTaskTitle("");
            trackEvent({ name: 'task_created', properties: { taskId: data.id, projectId } });
            showToast("Task created successfully", "success");
        },
        onError: (error: Error) => {
            showToast(error.message || "Failed to create task", "error");
        }
    });

    // Update Task Mutation
    const updateTaskMutation = useMutation({
        mutationFn: ({ id, title, status }: { id: string; title?: string; status?: Task["status"] }) =>
            fetcher<Task>(`/api/tasks/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ title, status }),
            }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
            setEditingTask(null);
            resetEditTask();
            trackEvent({ name: 'task_updated', properties: { taskId: data.id, projectId } });
            showToast("Task updated", "success");
        },
        onError: (error: Error) => {
            showToast(error.message || "Failed to update task", "error");
        }
    });

    // Delete Task Mutation
    const deleteTaskMutation = useMutation({
        mutationFn: (id: string) =>
            fetcher(`/api/tasks/${id}`, { method: "DELETE" }),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
            setDeletingTask(null);
            trackEvent({ name: 'task_deleted', properties: { taskId: id, projectId } });
            showToast("Task deleted", "success");
        },
        onError: (error: Error) => {
            console.error("Delete task failed:", error);
            showToast(error.message || "Failed to delete task. Please try again.", "error");
        }
    });

    const { register: regEditTask, handleSubmit: handleEditTask, formState: { errors: editTaskErrors }, reset: resetEditTask, setValue: setEditTaskValue } = useForm({
        resolver: yupResolver(taskSchema),
    });

    useEffect(() => {
        if (editingTask) {
            setEditTaskValue("title", editingTask.title);
        }
    }, [editingTask, setEditTaskValue]);

    const handleToggleTaskStatus = async (task: Task) => {
        const newStatus = task.status === "todo" ? "done" : "todo";
        try {
            await updateTaskMutation.mutateAsync({ id: task.id, status: newStatus });
            trackEvent({ 
                name: 'task_status_changed', 
                properties: { 
                    taskId: task.id, 
                    projectId, 
                    oldStatus: task.status, 
                    newStatus 
                } 
            });
        } catch (error) {
            console.error('Error updating task status:', error);
            showToast("Failed to update status", "error");
        }
    };

    if (!user) return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <p className="text-gray-500 font-bold">Please log in to view this project.</p>
        </div>
    );

    if (loadingProject) return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <main className="p-4 sm:p-6 lg:p-12 max-w-5xl mx-auto min-h-full">
            <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => router.push("/dashboard")}
                className="mb-6 sm:mb-8 flex items-center gap-2 text-gray-400 font-bold text-xs sm:text-sm uppercase tracking-widest hover:text-blue-600 transition-colors group"
            >
                <span className="group-hover:-translate-x-1 transition-transform">←</span> <span className="hidden sm:inline">Back to Dashboard</span><span className="sm:hidden">Back</span>
            </motion.button>

            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <span className="text-xs sm:text-sm font-bold">P</span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest">Workspace Project</p>
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-none">
                        {project?.name}
                    </h1>
                </div>
                <button
                    onClick={() => setIsCreatingTask(true)}
                    className="group bg-gray-900 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold shadow-lg sm:shadow-xl shadow-gray-900/10 hover:bg-gray-800 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
                >
                    <span className="text-lg sm:text-xl font-light relative -top-0.5">+</span> 
                    <span>New Task</span>
                </button>
            </header>

            <AnimatePresence>
                {isCreatingTask && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="mb-8 sm:mb-10 lg:mb-12 p-4 sm:p-6 lg:p-8 bg-white/50 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-[2rem] border border-blue-100 shadow-lg sm:shadow-[0_20px_50px_rgba(0,0,0,0.03)]"
                    >
                        <form onSubmit={(e) => { e.preventDefault(); createTaskMutation.mutate(newTaskTitle); }} className="flex flex-col gap-4 sm:gap-6">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <input
                                    placeholder="Brief task description..."
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl bg-white border border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-semibold text-gray-900 text-sm sm:text-base"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={createTaskMutation.isPending || !newTaskTitle.trim()}
                                    className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-lg sm:rounded-xl font-bold shadow-lg sm:shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 text-sm sm:text-base"
                                >
                                    {createTaskMutation.isPending ? "Adding..." : "Create"}
                                </button>
                            </div>
                            <div className="flex justify-end">
                                <button type="button" onClick={() => setIsCreatingTask(false)} className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors px-2">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col gap-6 sm:gap-8">
                <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">Workflow Queue</h2>
                        <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{filteredTasks?.length || 0} tasks</span>
                    </div>

                    {/* Search Bar */}
                    {tasks && tasks.length > 0 && (
                        <SearchBar 
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Filter tasks..."
                            className="mb-4 sm:mb-6 max-w-full sm:max-w-md"
                        />
                    )}

                    {loadingTasks ? (
                        <div className="space-y-3 sm:space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-20 sm:h-24 bg-gray-50 rounded-xl sm:rounded-2xl animate-pulse" />)}
                        </div>
                    ) : filteredTasks && filteredTasks.length > 0 ? (
                        <motion.div layout className="space-y-3 sm:space-y-4">
                            {filteredTasks.map((task, idx) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    index={idx}
                                    onEdit={() => setEditingTask(task)}
                                    onDelete={() => setDeletingTask(task)}
                                    onStatusChange={(task) => handleToggleTaskStatus(task)}
                                />
                            ))}
                        </motion.div>
                    ) : searchQuery.trim() ? (
                        <EmptyState
                            icon="🔍"
                            title="No tasks found"
                            description={`No tasks match "${searchQuery}". Try a different search.`}
                            action={
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
                                >
                                    Clear Search
                                </button>
                            }
                        />
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16 sm:py-20 lg:py-24 px-6 sm:px-10 bg-gray-50/50 rounded-2xl sm:rounded-[3rem] border-2 border-dashed border-gray-200/50 flex flex-col items-center"
                        >
                            <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 opacity-80">✨</div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No obstacles found</h3>
                            <button
                                onClick={() => setIsCreatingTask(true)}
                                className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                + Define your first task
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Floating Chat Widget */}
            <ChatWidget projectId={projectId} />

            <Toast 
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />

            {/* Modals */}
            <AnimatePresence>
                {editingTask && (
                    <Modal title="Edit Task" onClose={() => setEditingTask(null)}>
                        <p className="text-gray-500 mb-8 font-medium">Update the task title</p>
                        <form onSubmit={handleEditTask((data) => updateTaskMutation.mutate({ id: editingTask.id, title: data.title }))}>
                            <input
                                {...regEditTask("title")}
                                placeholder="Task title"
                                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none mb-4 transition-all font-semibold text-gray-900"
                                autoFocus
                            />
                            {editTaskErrors.title && <p className="text-red-500 text-sm mb-4 font-bold px-1">{editTaskErrors.title.message as string}</p>}
                            {updateTaskMutation.error && <p className="text-red-500 text-sm mb-4 font-bold px-1">{(updateTaskMutation.error as Error).message}</p>}
                            <div className="flex gap-4 mt-6">
                                <button type="button" onClick={() => setEditingTask(null)} className="flex-1 py-4 px-6 rounded-2xl border border-gray-100 text-gray-600 font-bold hover:bg-gray-50 transition-colors">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={updateTaskMutation.isPending}
                                    className="flex-1 py-4 px-6 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xl shadow-blue-200"
                                >
                                    {updateTaskMutation.isPending ? "Updating..." : "Update"}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}

                {deletingTask && (
                    <DeleteConfirmationModal
                        isOpen={true}
                        onClose={() => setDeletingTask(null)}
                        onConfirm={() => deleteTaskMutation.mutate(deletingTask.id)}
                        title="Delete Task"
                        itemName={deletingTask.title}
                        itemType="task"
                        isDeleting={deleteTaskMutation.isPending}
                    />
                )}
            </AnimatePresence>
        </main>
    );
}
