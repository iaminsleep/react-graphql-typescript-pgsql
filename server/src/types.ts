import { Request, Response } from "express";
import { Session } from "express-session";
import { Redis } from "ioredis";

interface SessionData {
  userId?: number;
}

export type MyContext = {
    req: Request & { 
        session:  Session & Partial<SessionData> & SessionData
    },

    res: Response,

    redis: Redis,
}