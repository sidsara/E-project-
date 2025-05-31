const express = require("express");
const app = express();
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const http = require("http");
const initSocket = require("./socket");
const server = http.createServer(app);
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ["query", "error", "warn"],
});
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs-extra");
const demandesRoutes = require("./routes/demandesujetRoute");

// Retry mechanism for database connection
async function connectWithRetry(retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log("Successfully connected to the database");

      // Test the connection with a simple query
      await prisma.$queryRaw`SELECT 1`;

      return true;
    } catch (error) {
      console.error(`Connection attempt ${i + 1} failed:`, error);

      // Close any hanging connections
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.error("Error during disconnect:", disconnectError);
      }

      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  return false;
}

// Créer le dossier pour les PV s'il n'existe pas
fs.ensureDirSync(path.join(__dirname, 'uploads-pv'));

app.use("/uploads-img", express.static("uploads-img"));
app.use("/uploads-livrables", express.static("uploads-livrables"));
app.use("/uploads", express.static("uploads"));
app.use('/uploads-pv', express.static(path.join(__dirname, 'uploads-pv')));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

// Routes
const authRoutes = require("./routes/authRoute");
const sujetAffecRoutes = require("./routes/sujetAffectationRoute");
const sujetRoutes = require("./routes/sujetRoutes");
const adminRoutes = require("./routes/AdminRoute");
const dataRoutes = require("./routes/dataRoute");
const equipeRoutes = require("./routes/equipeRoute");
const userRoutes = require("./routes/user"); // ou authRoutes.js
const invitationRoutes = require("./routes/invitationRoutes");
const projectRoutes = require("./routes/projectRoute");
const soutenanceRoutes = require("./routes/soutenanceRoute");
const noteroute = require("./routes/NoteSout")
app.use("/", userRoutes);

app.use("/", sujetAffecRoutes);
app.use("/", adminRoutes);
app.use("/", authRoutes);
app.use("/", sujetRoutes);
app.use("/", dataRoutes);
app.use("/", equipeRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/", projectRoutes);
app.use("/api/demandes", demandesRoutes);
app.use("/", soutenanceRoutes);

const chatRoutes = require("./routes/chatRoute");
app.use("/api/chat", chatRoutes);

app.use("/",noteroute)

// Start server only after successful database connection
const PORT = 3000;
connectWithRetry().then((connected) => {
  if (connected) {
    server.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
    initSocket(server); // Passer server au lieu de app
  } else {
    console.error("Failed to connect to database after multiple retries");
    process.exit(1);
  }
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});