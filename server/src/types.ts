import { Request, Response } from "express";
import { Session } from "express-session";
import { Redis } from "ioredis";
import { createUpvoteLoader, createUserLoader } from "./utils/DataLoader";

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

    upvoteLoader: ReturnType<typeof createUpvoteLoader> // lifehack
}