import express, { Application, Request, Response } from "express";
import routes from "./routes";
import { requestLogger } from "./middlewares/logger.middleware";
import { rateLimiter } from "./middlewares/rateLimiter.middleware";
import { requestIdMiddleware } from "./middlewares/requestId.middleware";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

const app: Application = express();

app.use(requestIdMiddleware);  // paling atas, sebelum middleware lain
app.use(requestLogger);
app.use(express.json());
app.use(rateLimiter);

app.use("/api", routes); // ditambahkan prefix api

app.get("/test", (req: Request, res: Response) => {
  res.json({ pesan: "Halo", requestId: req.requestId });
});

app.use(notFoundHandler);  
app.use(errorHandler);     

export default app;