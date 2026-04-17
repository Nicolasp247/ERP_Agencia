import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "@/core/config/env";
import { errorHandler } from "@/core/middleware/error-handler";
import { apiRouter } from "@/routes";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN
    })
  );
  app.use(helmet());
  app.use(express.json());
  app.use(morgan("dev"));

  app.use("/api", apiRouter);
  app.use(errorHandler);

  return app;
}
