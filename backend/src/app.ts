import express from "express";
import cors from "cors";
import router from "./routes";
import { errorHandler } from "./middleware/error-handler";

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api", router);

  // Must be registered last.
  app.use(errorHandler);

  return app;
}
