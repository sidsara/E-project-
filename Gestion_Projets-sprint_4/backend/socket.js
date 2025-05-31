const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:3001"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSockets = new Map();

  io.use((socket, next) => {
    const cookie = socket.handshake.headers.cookie;
    if (!cookie) {
      return next(new Error("Authentication error"));
    }

    const token = cookie
      .split(";")
      .find((c) => c.trim().startsWith("jwt="))
      ?.split("=")[1];

    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role || "unknown";
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    // console.log("User connected:", socket.userId);
    userSockets.set(socket.userId.toString(), socket.id);

    socket.on("sendMessage", ({ text, to, timestamp }) => {
      const fromUserId = socket.userId.toString();
      const toUserId = to.toString();

      // Validation des données
      if (!text || !text.trim()) {
        socket.emit("messageError", { message: "Message cannot be empty" });
        return;
      }

      if (!to) {
        socket.emit("messageError", { message: "Recipient not specified" });
        return;
      }

      // Éviter l'auto-envoi
      if (fromUserId === toUserId) {
        socket.emit("messageError", {
          message: "Cannot send message to yourself",
        });
        return;
      }

      // console.log("Message details:", {
      //   from: fromUserId,
      //   to: toUserId,
      //   text: text.trim(),
      //   timestamp,
      // });

      // console.log("Available sockets:", Array.from(userSockets.keys()));
      // console.log("Looking for recipient:", toUserId);

      const messageData = {
        text: text.trim(),
        from: fromUserId,
        to: toUserId,
        timestamp: timestamp || new Date().toISOString(),
      };

      // Chercher le socket du destinataire
      const recipientSocketId = userSockets.get(toUserId);

      // Envoyer au destinataire si en ligne
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receiveMessage", messageData);
        console.log(
          `Message sent to recipient ${toUserId} (socket: ${recipientSocketId})`
        );
      } else {
        console.log(`Recipient ${toUserId} is offline or not found`);
      }

      // Confirmer l'envoi à l'expéditeur
      socket.emit("messageSent", messageData);
      // console.log(`Message confirmation sent to sender ${fromUserId}`);
    });

    socket.on("disconnect", (reason) => {
      userSockets.delete(socket.userId.toString());
      // console.log("User disconnected:", socket.userId, "Reason:", reason);
    });

    socket.on("error", (error) => {
      console.error("Socket error for user", socket.userId, ":", error);
    });
  });

  return io;
}

module.exports = initSocket;
