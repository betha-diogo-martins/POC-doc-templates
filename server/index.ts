import express from "express";
import cors from "cors";
import templateRoutes from "./routes/templates";
import { closeDb } from "./db";

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.use("/api/templates", templateRoutes);

/** Health check. */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const server = app.listen(PORT, () => {
  console.log(`[server] API running on http://localhost:${PORT}`);
});

/** Graceful shutdown. */
const shutdown = async () => {
  console.log("[server] Shutting down...");
  await closeDb();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
