require("dotenv").config();

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
  process.exit(1);
});

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const checkEndedAuctions = require("./jobs/checkEndedAuctions");
const {
  incrementViewer,
  decrementViewer,
} = require("./utils/auctionViewerStore");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinAuction", (auctionId) => {
    const roomId = auctionId.toString();

    socket.join(roomId);
    socket.auctionRoom = roomId;

    const viewerCount = incrementViewer(roomId);
    io.to(roomId).emit("viewerCount", {
      auctionId: roomId,
      count: viewerCount,
    });
  });

  socket.on("leaveAuction", (auctionId) => {
    const roomId = auctionId.toString();

    socket.leave(roomId);

    const viewerCount = decrementViewer(roomId);
    io.to(roomId).emit("viewerCount", {
      auctionId: roomId,
      count: viewerCount,
    });
  });

  socket.on("disconnect", () => {
    if (socket.auctionRoom) {
      const viewerCount = decrementViewer(socket.auctionRoom);
      io.to(socket.auctionRoom).emit("viewerCount", {
        auctionId: socket.auctionRoom,
        count: viewerCount,
      });
    }

    console.log("User disconnected:", socket.id);
  });
});

app.set("io", io);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB connected successfully");

    checkEndedAuctions();

    setInterval(async () => {
      try {
        await checkEndedAuctions();
      } catch (error) {
        console.error("Scheduled checkEndedAuctions error:", error.message);
      }
    }, 5000);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error.message);
    process.exit(1);
  }
};

startServer();