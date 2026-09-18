import dotenv from "dotenv";
dotenv.config();

export const config = {
  app: {
    port: Number(process.env.PORT) || 3000,
    env: process.env.NODE_ENV || "development",
  },
  security: {
    apiKey: process.env.API_KEY || "kunci-rahasia",
  },
};