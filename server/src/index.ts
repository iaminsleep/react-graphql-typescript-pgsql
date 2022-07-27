/** Environment constants **/
import { 
    COOKIE_NAME, 
    __prod__, 
    __port__  
} from "./constants";

/** Libraries **/ 
import "reflect-metadata"; // to see more errors
import { MikroORM } from "@mikro-orm/core"; // To interact with PostgreSQL database
import MikroORMConfig from "./mikro-orm.config"; // config
import express from "express"; // For server init
import { ApolloServer } from "apollo-server-express"; // For GraphQL
import { buildSchema } from "type-graphql"; // Typescript GraphQL
import session from "express-session"; // for Redis
import Redis from "ioredis"; // Redis

/** Resolvers **/
import { HelloResolver } from "./resolvers/HelloResolver";
import { PostResolver } from "./resolvers/PostResolver";
import { UserResolver } from "./resolvers/UserResolver";
import { MyContext } from "./types";

const main = async() => {
    //Configure MikroORM
    const orm = await MikroORM.init(MikroORMConfig);
    // orm.em.nativeDelete(User, {}); // wipe all the data
    await orm.getMigrator().up(); // make migration at the start

    // Initialize app
    const app = express();
    const port = __port__ || 8080;

    // Configure Redis@v4. Cookies will be stored inside redis server since.
    let RedisStore = require("connect-redis")(session)
    let redis = new Redis(); // connect ioredis to redis. original: import { createClient } from "redis"; let redisClient = createClient({ legacyMode: true });
    redis.connect().catch(console.error)

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({ client: redis }),
            saveUninitialized: false, // session creates only when it is set
            secret: "expressjsapollographqlredismikroorm",
            resave: false,
            cookie: {
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
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({req, res }): MyContext => (
            { em: orm.em, req, res, redis }
        ), //We can access the entity manager, request and response through context
    });
    await server.start();
    server.applyMiddleware({ 
        app, 
        cors: {
            origin: [
                "http://localhost:3000",
                "https://studio.apollographql.com",
            ],
            credentials: true,
        }, 
    });

    // app.set("trust proxy", 1); //If your server is behind a proxy (Heroku, Nginx, Now, etc...)

    app.listen(port, () => {
        console.log('Server started on localhost: ', port);
        console.log('Press Ctrl+C to exit');
    });
}

main().catch((err) => {
    console.log(err);
});