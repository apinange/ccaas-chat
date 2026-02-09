import "./loadEnv.js";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import messageRoutes from "./routes/messages.js";
import agentAssistRoutes from "./routes/agentAssist.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { startWebSocketServer } from "./services/websocketServer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3006;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
const uploadDir = process.env.UPLOAD_DIR || "./uploads";
const uploadPath = path.isAbsolute(uploadDir)
  ? uploadDir
  : path.join(__dirname, "..", uploadDir);
app.use("/uploads", express.static(uploadPath));

// Routes
app.use("/", messageRoutes);
app.use("/api/agent-assist", agentAssistRoutes);

// Error handling middleware
app.use(errorHandler);

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Start WebSocket server for Agent Assist Widget (same port as HTTP)
startWebSocketServer(server);

// Clean up old "gotcha" references from database on startup (one-time migration)
import { cleanupGotchaReferences } from "./storage/agentAssistStorage.js";
try {
  const cleanupResult = cleanupGotchaReferences();
  if (cleanupResult.updated > 0) {
    console.log(
      `[Migration] Cleaned up "gotcha" references: ${cleanupResult.updated} records updated out of ${cleanupResult.total} total`,
    );
  }
} catch (error) {
  console.warn(
    "[Migration] Error cleaning up gotcha references (non-critical):",
    error.message,
  );
}

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

export default app;
