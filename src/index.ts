import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import routes from "./routes";
import { requestLogger } from "./middlewares/logger.middleware";
import { rateLimiter } from "./middlewares/rateLimiter.middleware";
import { tambahRequestId } from "./middlewares/requestId.middleware";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

dotenv.config();

const app: Application = express();
const PORT = Number(process.env.PORT) || 3000;

//  Middleware global — jalan di setiap request, urutan sesuai yang sudah ada
app.use(tambahRequestId);
app.use(requestLogger);
app.use(express.json());
app.use(rateLimiter);

//  Routes
app.use(routes);

app.get("/test", (req: Request, res: Response) => {
  res.json({
    pesan: "Halo",
    requestId: req.requestId,
  });
});

//  Route tidak ditemukan — setelah SEMUA route
app.use(notFoundHandler);

//  Error handler - setelah semua middleware & route
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});