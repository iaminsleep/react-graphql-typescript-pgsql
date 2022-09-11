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

/** Resolvers **/
import { PostResolver } from "./resolvers/PostResolver";
import { UserResolver } from "./resolvers/UserResolver";
import { MyContext } from "./types";
import { LikeResolver } from "./resolvers/LikeResolver";
import { createUpvoteLoader, createUserLoader } from "./utils/DataLoader";
import { AppDataSource } from "./typeorm-data-source";
import { UploadResolver } from "./resolvers/UploadResolver";

import { graphqlUploadExpress } from 'graphql-upload';
import cors from 'cors';

const main = async() => {
    // Initialize app
    const app = express();
    const port = __port__ || 8080;

    // Configure Redis@v4. Cookies will be stored inside redis server since.
    let RedisStore = require("connect-redis")(session)
    let redis = new Redis(); // connect ioredis to redis. original: import { createClient } from "redis"; let redisClient = createClient({ legacyMode: true });
    // redis.connect()

    AppDataSource.initialize()
        .then(async () => {
            // AppDataSource.runMigrations(); //to run migrations in index.ts
            // Post.delete({});
            // User.delete({});
        })
        .catch((error) => console.log(error))

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
                sameSite: 'lax', // 'none'
            }
        })
    )  //Order matters, so redis session middleware will run before the apollo middleware. (It's important because session middleware will be used inside apollo)
    
    // Configure ApolloGraphQL server
    const server = new ApolloServer({
        schema: await buildSchema({
            resolvers: [
                PostResolver, 
                UserResolver, 
                LikeResolver,
                UploadResolver,
            ],
            validate: false,
        }),
        csrfPrevention: true,
        cache: 'bounded',
        context: ({ req, res }): MyContext => ({ 
            req, 
            res, 
            redis, 
            userLoader: createUserLoader(), 
            upvoteLoader: createUpvoteLoader()
        }), //We can access the entity manager, request and response through context
    });
    await server.start();
    
      // This middleware should be added before calling `applyMiddleware`.
    app.use(graphqlUploadExpress({ maxFileSize: 10000, maxFiles: 10 }));
  
    const corsOptions = {
        origin: [
            process.env.CORS_ORIGIN!,
            !__prod__ ?? "https://studio.apollographql.com",
        ],
        credentials: true,
    };
    server.applyMiddleware({ 
        app, 
        cors: corsOptions, 
    });

    app.use(cors());

    app.set("trust proxy", __prod__); //If your server is behind a proxy (Heroku, Nginx, Now, etc...)

    app.listen(port, () => {
        console.log('Server started on localhost:', port);
        console.log('Press Ctrl+C to exit');
    });
}

main().catch((err) => {
    console.log(err);
});