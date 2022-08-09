"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv-safe').config({
    allowEmptyValues: true,
    example: './.env.example'
});
const constants_1 = require("./constants");
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const express_session_1 = __importDefault(require("express-session"));
const ioredis_1 = __importDefault(require("ioredis"));
const apollo_server_core_1 = require("apollo-server-core");
const PostResolver_1 = require("./resolvers/PostResolver");
const UserResolver_1 = require("./resolvers/UserResolver");
const UpvoteResolver_1 = require("./resolvers/UpvoteResolver");
const DataLoader_1 = require("./utils/DataLoader");
const main = async () => {
    const app = (0, express_1.default)();
    const port = constants_1.__port__ || 8080;
    let RedisStore = require("connect-redis")(express_session_1.default);
    let redis = new ioredis_1.default();
    app.use((0, express_session_1.default)({
        name: constants_1.COOKIE_NAME,
        store: new RedisStore({
            client: redis,
            disableTouch: true,
        }),
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET,
        resave: false,
        cookie: {
            path: '/',
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            secure: constants_1.__prod__,
            sameSite: 'lax',
        }
    }));
    const server = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [
                PostResolver_1.PostResolver,
                UserResolver_1.UserResolver,
                UpvoteResolver_1.UpvoteResolver
            ],
            validate: false,
        }),
        cache: 'bounded',
        context: ({ req, res }) => ({
            req,
            res,
            redis,
            userLoader: (0, DataLoader_1.createUserLoader)(),
            upvoteLoader: (0, DataLoader_1.createUpvoteLoader)()
        }),
        plugins: [
            (0, apollo_server_core_1.ApolloServerPluginLandingPageLocalDefault)(),
        ],
    });
    await server.start();
    const corsOptions = {
        origin: [
            process.env.CORS_ORIGIN,
        ],
        credentials: true,
    };
    server.applyMiddleware({
        app,
        cors: corsOptions,
    });
    app.set("trust proxy", constants_1.__prod__);
    app.listen(port, () => {
        console.log('Server started on localhost:', port);
        console.log('Press Ctrl+C to exit');
    });
};
main().catch((err) => {
    console.log(err);
});
//# sourceMappingURL=index.js.map