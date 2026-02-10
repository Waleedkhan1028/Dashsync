// Database types matching Supabase schema
import { TaskStatus } from "./task";

export type Workspace = {
    id: string;
    name: string;
    created_at?: string;
};

export type Project = {
    id: string;
    name: string;
    workspace_id: string;
    created_at?: string;
    tasks?: { count: number }[]; // For aggregated counts
};

export type Task = {
    id: string;
    title: string;
    status: TaskStatus;
    project_id: string;
    created_at?: string;
};

export type Comment = {
    id: string;
    content: string;
    project_id: string;
    user_id: string;
    created_at: string;
    user_email?: string; // For UI display
};

// Re-export for convenience
export type { TaskStatus };
