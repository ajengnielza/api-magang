import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import routes from "./routes";

dotenv.config();

const app: Application = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ pesan: "API Magang Batch 4 berjalan" });
});

app.get("/info", (req: Request, res: Response) => {
  res.json({
    nama: "API Magang Batch 4",
    versi: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    waktu: new Date().toISOString(),
  });
});

app.use(routes);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});