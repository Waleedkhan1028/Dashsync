import { Project } from "@/types/database";
import ProjectCard from "@/components/ProjectCard";
import { motion } from "framer-motion";
import EmptyState from "@/components/ui/EmptyState";

interface ProjectListProps {
    projects: Project[] | undefined;
    isLoading: boolean;
    searchQuery: string;
    onEdit: (project: Project) => void;
    onDelete: (project: Project) => void;
    onCreateFirst: () => void;
    onClearSearch: () => void;
}

export function ProjectList({ projects, isLoading, searchQuery, onEdit, onDelete, onCreateFirst, onClearSearch }: ProjectListProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {[1, 2, 3].map(i => <div key={i} className="h-40 sm:h-48 bg-gray-100 rounded-2xl sm:rounded-3xl animate-pulse" />)}
            </div>
        );
    }

    if (!projects || projects.length === 0) {
        if (searchQuery.trim()) {
            return (
                <EmptyState
                    icon="🔍"
                    title="No projects found"
                    description={`No projects match "${searchQuery}". Try a different search.`}
                    action={
                        <button
                            onClick={onClearSearch}
                            className="text-blue-600 font-bold hover:text-blue-700 transition-colors text-sm sm:text-base font-sans"
                        >
                            Clear Search
                        </button>
                    }
                />
            );
        }
        
        return (
            <EmptyState
                icon="📁"
                title="Empty Workspace"
                description="No projects found. Launch your first project to start organizing your work."
                action={
                    <button
                        onClick={onCreateFirst}
                        className="bg-blue-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black hover:bg-blue-700 transition-all shadow-premium text-sm sm:text-base w-full sm:w-auto"
                    >
                        Start First Project
                    </button>
                }
            />
        );
    }

    return (
        <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
        >
            {projects.map((project, idx) => (
                <motion.div
                    key={project.id || `project-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                >
                    <ProjectCard
                        id={project.id}
                        name={project.name}
                        taskCount={project.tasks?.[0]?.count || 0}
                        onEdit={() => onEdit(project)}
                        onDelete={() => onDelete(project)}
                    />
                </motion.div>
            ))}
        </motion.div>
    );
}
