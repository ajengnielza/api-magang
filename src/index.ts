import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import routes from "./routes";
import { requestLogger } from "./middlewares/logger.middleware";
import { rateLimiter } from "./middlewares/rateLimiter.middleware";
import { tambahRequestId } from "./middlewares/requestId.middleware";

dotenv.config();

const app: Application = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(tambahRequestId);
app.use(requestLogger);
app.use(express.json());
app.use(rateLimiter);

app.use(routes);

app.get("/test", (req: Request, res: Response) => {
  res.json({
    pesan: "Halo",
    requestId: req.requestId,
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});