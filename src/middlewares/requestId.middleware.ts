import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export function tambahRequestId(req: Request, res: Response, next: NextFunction): void {
  req.requestId = crypto.randomUUID(); 
  next();
}