import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Task } from "@/types/database";

export function useTasks(projectId: string) {
    return useQuery({
        queryKey: ["tasks", projectId],
        queryFn: () => fetcher<Task[]>(`/api/projects/${projectId}/tasks`),
    });
}
