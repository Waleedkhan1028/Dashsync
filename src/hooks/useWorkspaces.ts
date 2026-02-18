import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Workspace } from "@/types/database";
import { useAuthStore } from "@/stores/auth.store";
import { trackEvent } from "@/lib/analytics";

export function useWorkspaces() {
    const user = useAuthStore((s) => s.user);
    const queryClient = useQueryClient();

    const { data: workspaces, isLoading, error } = useQuery({
        queryKey: ["workspaces"],
        queryFn: () => fetcher<Workspace[]>("/api/workspaces"),
        enabled: !!user,
    });

    const createWorkspaceMutation = useMutation({
        mutationFn: (workspaceName: string) =>
            fetcher<Workspace>("/api/workspaces", {
                method: "POST",
                body: JSON.stringify({ name: workspaceName }),
            }),
        onSuccess: (newWs) => {
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
            trackEvent({ name: 'workspace_created', properties: { workspaceId: newWs.id } });
        },
    });

    const deleteWorkspaceMutation = useMutation({
        mutationFn: (workspaceId: string) =>
            fetcher(`/api/workspaces/${workspaceId}`, { method: "DELETE" }),
        onSuccess: () => {
            // Refresh the workspace list after deletion
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        },
    });

    return {
        workspaces,
        isLoading,
        error,
        createWorkspace: createWorkspaceMutation.mutateAsync,
        isCreating: createWorkspaceMutation.isPending,
        createError: createWorkspaceMutation.error,
        deleteWorkspace: deleteWorkspaceMutation.mutateAsync,
        isDeleting: deleteWorkspaceMutation.isPending,
        deleteError: deleteWorkspaceMutation.error,
    };
}
