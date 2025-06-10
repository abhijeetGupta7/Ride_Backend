const socketIo = require("socket.io");
const { CLIENT_URL } = require("./config/server-config");

const UserService = require("./services/user.service");
const userService = new UserService();
const CaptainService = require("./services/captain.service");
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
        socket.join(userId);
        if (userType === "user") {
          await userService.updateSocketId(userId, socket.id);
        } else if (userType === "captain") {
          await captainService.updateSocketId(userId, socket.id);
        }
      } catch (err) {
        socket.emit("error", { message: "Join failed", error: err.message });
      }
    });

    socket.on("update-location-captain", async (data) => {
      try {
        const { userId, location } = data;
        if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
          return socket.emit("error", { message: "Invalid location data" });
        }
        await captainService.updateLocation(userId, [
          location.lng,
          location.lat,
        ]);
      } catch (err) {
        socket.emit("error", {
          message: "Location update failed",
          error: err.message,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      // We can Optionally clear socketId in DB here
    });
  });
}

const sendMessageToSocketId = (socketId, messageObject) => {
  if (io) {
    io.to(socketId).emit(messageObject.event, messageObject.data);
  } else {
    console.log("Socket.io not initialized.");
  }
};

const sendMessageToRoom = (roomId, messageObject) => {
  if (io) {
    io.to(roomId).emit(messageObject.event, messageObject.data);
  } else {
    console.log("Socket.io not initialized.");
  }
};

module.exports = { initializeSocket, sendMessageToSocketId, sendMessageToRoom };
