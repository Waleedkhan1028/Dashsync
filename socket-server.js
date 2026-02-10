const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for dev simplicity
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-project", (projectId) => {
        socket.join(projectId);
        console.log(`User ${socket.id} joined project: ${projectId}`);
    });

    socket.on("send-comment", (data) => {
        // data: { projectId, comment }
        console.log(`Project ${data.projectId}: New comment from ${data.comment.user_email}`);
        // Broadcast to everyone in the room INCLUDING the sender (or use optimistic UI)
        // Here we broadcast to everyone in the room
        io.to(data.projectId).emit("new-comment", data.comment);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Socket.io server running on port ${PORT}`);
});
