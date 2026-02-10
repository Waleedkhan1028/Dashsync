const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : "*",
        methods: ["GET", "POST"],
        credentials: true
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
        // Broadcast to everyone in the room INCLUDING the sender
        io.to(data.projectId).emit("new-comment", data.comment);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Socket.io server running on port ${PORT}`);
});
