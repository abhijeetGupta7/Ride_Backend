const socketIo = require("socket.io");
const { CLIENT_URL } = require("./config/server-config");

const UserService = require("./services/user.service");
const userService = new UserService();
const CaptainService = require("./services/captain.service");
const { storeCaptainSocket } = require("./utils/redisHelper");
const captainService = new CaptainService();

let io;

function initializeSocket(server) {
  console.log(CLIENT_URL);
  io = socketIo(server, {
    cors: {
      origin: CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("join", async (data) => {
      try {
        const { userId, userType } = data;
        if (!userId || !userType) {
          return socket.emit("error", {
            message: "Missing userId or userType",
          });
        }

        socket.join(userId);
        if (userType === "user") {
          await userService.updateSocketId(userId, socket.id);
        } else if (userType === "captain") {
          console.log("captain socket");
          await storeCaptainSocket(userId, socket.id);
          await captainService.updateSocketId(userId, socket.id);
        }
      } catch (err) {
        console.error("Join error:", err);
        socket.emit("error", { message: "Join failed", error: err.message });
      }
    });

    socket.on("update-location-captain", async (data) => {
      try {
        const { userId, location } = data;
        if (!userId || !location) {
          return socket.emit("error", { message: "Invalid location data" });
        }
        await captainService.updateLocation(userId, [
          location.lng,
          location.lat,
        ]);
      } catch (err) {
        console.error("Location update error:", err);
        socket.emit("error", {
          message: "Location update failed",
          error: err.message,
        });
      }
    });

    socket.on("disconnect", async () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

function sendMessageToSocketId(socketId, messageObject) {
  if (!io) {
    console.log("Socket.io not initialized.");
    return false;
  }

  if (!socketId || !messageObject || !messageObject.event) {
    console.log("Invalid parameters for sendMessageToSocketId");
    return false;
  }

  io.to(socketId).emit(messageObject.event, messageObject.data);
  return true;
}

module.exports = { initializeSocket, sendMessageToSocketId };
