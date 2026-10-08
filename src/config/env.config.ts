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
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "magang_db",
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  cors: {
  origins: (process.env.CORS_ORIGINS || "http://localhost:5173").split(","),
},
};

export const isProd = config.app.env === "production";