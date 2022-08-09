require('dotenv-safe').config({
    allowEmptyValues: true,
    example: './.env.example'
});
import { 
    COOKIE_NAME, 
    __prod__, 
    __port__  
} from "./constants";

/** Libraries **/ 
import "reflect-metadata"; // to see more errors
import express from "express"; // For server init
import { ApolloServer } from "apollo-server-express"; // For GraphQL
import { buildSchema } from "type-graphql"; // Typescript GraphQL
import session from "express-session"; // for Redis
import Redis from "ioredis"; // Redis
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';

/** Resolvers **/
import { PostResolver } from "./resolvers/PostResolver";
import { UserResolver } from "./resolvers/UserResolver";
import { MyContext } from "./types";
import { UpvoteResolver } from "./resolvers/UpvoteResolver";
import { createUpvoteLoader, createUserLoader } from "./utils/DataLoader";

const main = async() => {
    // Initialize app
    const app = express();
    const port = __port__ || 8080;

    // Configure Redis@v4. Cookies will be stored inside redis server since.
    let RedisStore = require("connect-redis")(session)
    let redis = new Redis(); // connect ioredis to redis. original: import { createClient } from "redis"; let redisClient = createClient({ legacyMode: true });
    // redis.connect()

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({ 
                client: redis,
                disableTouch: true,
             }),
            saveUninitialized: false, // session creates only when it is set
            secret: process.env.SESSION_SECRET!,
            resave: false,
            cookie: {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24, // 1 day
                httpOnly: true,
                secure: __prod__, // cookie only works in https
                sameSite: 'lax', // csrf protection
            }
        })
    )  //Order matters, so redis session middleware will run before the apollo middleware. (It's important because session middleware will be used inside apollo)

    // Configure ApolloGraphQL server
    const server = new ApolloServer({
        schema: await buildSchema({
            resolvers: [
                PostResolver, 
                UserResolver, 
                UpvoteResolver
            ],
            validate: false,
        }),
        cache: 'bounded',
        context: ({ req, res }): MyContext => ({ 
            req, 
            res, 
            redis, 
            userLoader: createUserLoader(), 
            upvoteLoader: createUpvoteLoader()
        }), //We can access the entity manager, request and response through context
        plugins: [
            ApolloServerPluginLandingPageLocalDefault(),
        ],
    });
    await server.start();
    
    const corsOptions = {
        origin: [
            process.env.CORS_ORIGIN!,
        ],
        credentials: true,
    };
    server.applyMiddleware({ 
        app, 
        cors: corsOptions, 
    });

    app.set("trust proxy", __prod__); //If your server is behind a proxy (Heroku, Nginx, Now, etc...)

    app.listen(port, () => {
        console.log('Server started on localhost:', port);
        console.log('Press Ctrl+C to exit');
    });
}

main().catch((err) => {
    console.log(err);
});