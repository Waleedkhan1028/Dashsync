import { useEffect } from "react";
import { socket } from "@/lib/socket";

export function useSocket(projectId: string) {
  useEffect(() => {
    socket.connect();
    socket.emit("JOIN_PROJECT", projectId);

    return () => {
      socket.emit("LEAVE_PROJECT", projectId);
      socket.disconnect();
    };
  }, [projectId]);
}
