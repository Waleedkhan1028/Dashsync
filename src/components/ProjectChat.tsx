"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { socket } from "@/lib/socket";
import { Comment } from "@/types/database";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";

interface ProjectChatProps {
    projectId: string;
}

export default function ProjectChat({ projectId }: ProjectChatProps) {
    const user = useAuthStore((s) => s.user);
    const queryClient = useQueryClient();
    const [message, setMessage] = useState("");
    const [isConnected, setIsConnected] = useState(socket.connected);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Fetch existing comments
    const { data: comments, isLoading } = useQuery({
        queryKey: ["comments", projectId],
        queryFn: () => fetcher<Comment[]>(`/api/projects/${projectId}/comments`),
        enabled: !!projectId,
    });

    // 2. Setup Socket.io
    useEffect(() => {
        if (!projectId) return;

        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        // Initialize connection
        if (!socket.connected) {
            socket.connect();
        }
        
        socket.emit("join-project", projectId);

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        
        const handleNewComment = (newComment: Comment) => {
            // Update React Query cache
            queryClient.setQueryData(["comments", projectId], (old: Comment[] | undefined) => {
                if (!old) return [newComment];
                // Check if comment already exists (for the sender who might have added it optimistically or via mutation)
                if (old.find(c => c.id === newComment.id)) return old;
                return [...old, newComment];
            });
        };

        socket.on("new-comment", handleNewComment);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("new-comment", handleNewComment);
            // Don't disconnect here to share connection across components if needed, 
            // but if this is the only one, we might want to. 
            // For now, let's leave it open or handle properly.
            // Actually, best practice often strictly matches mount/unmount.
            // But let's keep it simple.
        };
    }, [projectId, queryClient]);

    // 3. Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [comments]);

    // 4. Send message mutation
    const sendMutation = useMutation({
        mutationFn: (content: string) => fetcher<Comment>(`/api/projects/${projectId}/comments`, {
            method: "POST",
            body: JSON.stringify({ content }),
        }),
        onSuccess: (newComment) => {
            // OPTIMISTIC UPDATE: Immediately show the new comment for the sender
            queryClient.setQueryData(["comments", projectId], (old: Comment[] | undefined) => {
                if (!old) return [newComment];
                // Prevent duplicate if socket event comes in later
                if (old.find(c => c.id === newComment.id)) return old;
                return [...old, newComment];
            });

            // Emit to server (best effort)
            if (socket.connected) {
                socket.emit("send-comment", { projectId, comment: newComment });
            }
            
            setMessage("");
        },
    });

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || sendMutation.isPending) return;
        sendMutation.mutate(message);
    };

    return (
        <div className="flex flex-col h-full bg-white/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/40 shadow-[0_30px_60px_rgba(0,0,0,0.05)] overflow-hidden ring-1 ring-white/60">
            <header className="p-6 border-b border-white/20 flex items-center justify-between bg-white/30 backdrop-blur-md">
                <div className="flex flex-col">
                    <h3 className="font-black text-gray-800 uppercase tracking-widest text-[11px] flex items-center gap-2">
                        <span className="text-xl filter drop-shadow-sm">💬</span> 
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">Project Discussion</span>
                    </h3>
                    <p className="text-[10px] font-bold text-gray-500 mt-1 px-8 lowercase tracking-wide flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-400"} transition-colors`} /> 
                        {isConnected ? "realtime active" : "connecting..."}
                    </p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm backdrop-blur-sm transition-all duration-500 ${
                    isConnected 
                        ? "bg-white/50 border-white/60 text-green-700" 
                        : "bg-red-50/50 border-red-100 text-red-600"
                }`}>
                    <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)] transition-all ${
                        isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                    }`} />
                    <span className="text-[10px] font-black uppercase tracking-wider">
                        {isConnected ? "Online" : "Offline"}
                    </span>
                </div>
            </header>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
                style={{
                    backgroundImage: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.8) 0%, transparent 70%)"
                }}
            >
                {isLoading ? (
                    <div className="flex flex-col gap-6 p-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 w-3/4 bg-gray-100/50 rounded-[2rem] animate-pulse backdrop-blur-sm" />
                        ))}
                    </div>
                ) : (
                    <AnimatePresence initial={false} mode="popLayout">
                        {comments?.map((c) => {
                            const isMe = c.user_id === user?.id;
                            return (
                                <motion.div
                                    key={c.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: 10, filter: "blur(5px)" }}
                                    animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                                    transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                                    className={`flex flex-col ${isMe ? "items-end" : "items-start"} group`}
                                >
                                    <div className={`
                                        max-w-[85%] p-5 rounded-[2rem] text-sm leading-relaxed relative overflow-hidden transition-all duration-300
                                        ${isMe
                                            ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm shadow-[0_10px_20px_rgba(79,70,229,0.2)]"
                                            : "bg-white/80 backdrop-blur-md text-gray-700 border border-white/60 rounded-tl-sm shadow-[0_5px_15px_rgba(0,0,0,0.02)]"
                                        }
                                    `}>
                                        {/* Glossy overlay effect */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                                        
                                        <div className="relative z-10 font-medium tracking-wide">
                                            {c.content}
                                        </div>
                                    </div>
                                    
                                    <div className={`flex items-center gap-2 mt-2 px-1 opacity-60 group-hover:opacity-100 transition-opacity ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                            {isMe ? "You" : c.user_email?.split('@')[0] || "User"}
                                        </span>
                                        <span className="text-[9px] font-bold text-gray-300">
                                            {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>

            <div className="p-4 bg-white/30 backdrop-blur-xl border-t border-white/20">
                <form onSubmit={handleSend} className="relative flex items-center group">
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-2xl rounded-[2rem] shadow-sm border border-white/50 transition-all duration-300 group-focus-within:bg-white/60 group-focus-within:shadow-md group-focus-within:border-blue-200/50" />
                    
                    <input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full pl-8 pr-20 py-5 bg-transparent relative z-10 outline-none font-bold text-gray-800 placeholder:text-gray-400 text-sm"
                    />
                    
                    <div className="absolute right-2 z-20">
                        <button
                            disabled={!message.trim() || sendMutation.isPending}
                            className="w-12 h-12 bg-gradient-to-tr from-gray-900 to-gray-800 text-white rounded-[1.5rem] flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-0 disabled:scale-50 shadow-lg shadow-gray-900/20"
                        >
                            <span className="text-lg translate-x-0.5 -translate-y-0.5">↑</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
