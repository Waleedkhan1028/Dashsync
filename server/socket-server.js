const { Server } = require("socket.io");
const http = require("http");

/**
 * Socket.io Server Setup
 * This server handles real-time communication for the Dashsync application,
 * primarily used for real-time project collaboration and chat/comments.
 */

// Initialize HTTP server
const server = http.createServer();

// Initialize Socket.io with CORS configuration
const io = new Server(server, {
    cors: {
        // Allow origins from environment variable or default to all (*)
        origin: process.env.ALLOWED_ORIGINS 
            ? process.env.ALLOWED_ORIGINS.split(",") 
            : "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

/**
 * Connection Handler
 * Manages individual client connections and their event listeners.
 */
io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    /**
     * Join Project Room
     * Allows clients to subscribe to updates for a specific project.
     * @param {string} projectId - The ID of the project to join.
     */
    socket.on("join-project", (projectId) => {
        if (!projectId) return;
        
        socket.join(projectId);
        console.log(`[Socket] User ${socket.id} joined room: ${projectId}`);
    });

    /**
     * Send/Receive Comments
     * Broadcasts new comments to all participants in a project room.
     * @param {Object} data - Contains projectId and comment object.
     */
    socket.on("send-comment", (data) => {
        const { projectId, comment } = data;
        
        if (!projectId || !comment) {
            console.warn(`[Socket] Invalid comment data received from ${socket.id}`);
            return;
        }

        console.log(`[Socket] Project ${projectId}: New comment from ${comment.user_email}`);
        
        // Broadcast the new comment to everyone in the project room (including sender)
        io.to(projectId).emit("new-comment", comment);
    });

    /**
     * Disconnect Handler
     */
    socket.on("disconnect", (reason) => {
        console.log(`[Socket] Client disconnected: ${socket.id} (Reason: ${reason})`);
    });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`[Socket] Server is running on port ${PORT}`);
});
