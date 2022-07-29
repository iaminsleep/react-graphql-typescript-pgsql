import { MyContext } from "src/types";
import { MiddlewareFn } from "type-graphql";

// Middleware runs before resolvers;
export const isAuth: MiddlewareFn<MyContext> = ({context}, next) => {
    if(!context.req.session.userId) {
        throw new Error('You are not authenticated');
    }

    return next(); // continue functioning
}