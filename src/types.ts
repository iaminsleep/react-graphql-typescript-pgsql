import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import { Request, Response } from "express";
import { Session } from "express-session";

interface SessionData {
  userId?: number;
}

export type MyContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>,

    req: Request & { 
        session:  Session & Partial<SessionData> & SessionData
    },

    res: Response,
}