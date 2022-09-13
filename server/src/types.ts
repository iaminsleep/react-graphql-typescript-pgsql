import { Request, Response } from "express";
import { Session } from "express-session";
import { Redis } from "ioredis";
import { createLikeLoader, createUserLoader } from "./utils/DataLoader";

interface SessionData {
  userId?: number;
}

export type MyContext = {
    req: Request & { 
      session:  Session & Partial<SessionData> & SessionData
    },

    res: Response,

    redis: Redis,

    userLoader: ReturnType<typeof createUserLoader> // lifehack

    likeLoader: ReturnType<typeof createLikeLoader> // lifehack
}