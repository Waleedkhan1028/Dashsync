import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Project } from "@/types/database";
import { trackEvent } from "@/lib/analytics";

export function useProjects(workspaceId: string | null) {
    const queryClient = useQueryClient();

    const { data: projects, isLoading, error } = useQuery({
        queryKey: ["projects", workspaceId],
        queryFn: () => fetcher<Project[]>(`/api/workspaces/${workspaceId}/projects`),
        enabled: !!workspaceId,
    });

    const createProjectMutation = useMutation({
        mutationFn: ({ projectName }: { projectName: string }) =>
            fetcher<Project>(`/api/workspaces/${workspaceId}/projects`, {
                method: "POST",
                body: JSON.stringify({ name: projectName }),
            }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
            trackEvent({ name: 'project_created', properties: { projectId: data.id, workspaceId: data.workspace_id } });
        },
    });

    const updateProjectMutation = useMutation({
        mutationFn: ({ id, projectName }: { id: string; projectName: string }) =>
            fetcher<Project>(`/api/projects/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ name: projectName }),
            }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
            trackEvent({ name: 'project_updated', properties: { projectId: data.id } });
        },
    });

    const deleteProjectMutation = useMutation({
        mutationFn: (id: string) =>
            fetcher(`/api/projects/${id}`, { method: "DELETE" }),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
            trackEvent({ name: 'project_deleted', properties: { projectId: id } });
        },
    });

    return {
        projects,
        isLoading,
        error,
        createProject: createProjectMutation.mutateAsync,
        updateProject: updateProjectMutation.mutateAsync,
        deleteProject: deleteProjectMutation.mutateAsync,
        isCreating: createProjectMutation.isPending,
        isUpdating: updateProjectMutation.isPending,
        isDeleting: deleteProjectMutation.isPending,
        createError: createProjectMutation.error,
        updateError: updateProjectMutation.error,
        deleteError: deleteProjectMutation.error,
    };
}
