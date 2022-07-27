import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import { Request, Response } from "express";
import { Session } from "express-session";
import { Redis } from "ioredis";

interface SessionData {
  userId?: number;
}

export type MyContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>,

    req: Request & { 
        session:  Session & Partial<SessionData> & SessionData
    },

    res: Response,

    redis: Redis,
}