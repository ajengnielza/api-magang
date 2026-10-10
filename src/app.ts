import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import routes from "./routes";
import healthRoutes from "./routes/health.routes";
import { requestLogger } from "./middlewares/logger.middleware";
import { requestIdMiddleware } from "./middlewares/requestId.middleware";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { config } from "./config/env.config";

const app: Application = express();

app.use(requestIdMiddleware);
app.use(helmet());
app.use(cors({ origin: config.cors.origins, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);

app.use("/api/v1", healthRoutes);   // health ikut versi, supaya semua route seragam
app.use("/api/v1", routes);

app.get("/test", (req: Request, res: Response) => {
  res.json({ pesan: "Halo", requestId: req.requestId });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;