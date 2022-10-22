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
const redis_memory_server_1 = require("redis-memory-server");
const PostResolver_1 = require("./resolvers/PostResolver");
const UserResolver_1 = require("./resolvers/UserResolver");
const LikeResolver_1 = require("./resolvers/LikeResolver");
const DataLoader_1 = require("./utils/DataLoader");
const typeorm_data_source_1 = require("./typeorm-data-source");
const UploadResolver_1 = require("./resolvers/UploadResolver");
const graphql_upload_1 = require("graphql-upload");
const cors_1 = __importDefault(require("cors"));
const main = async () => {
    var _a;
    const app = (0, express_1.default)();
    const port = constants_1.__port__ || 8080;
    const redisServer = new redis_memory_server_1.RedisMemoryServer({
        instance: {
            port: 6379
        }
    });
    const redisHost = await redisServer.getHost();
    const redisPort = await redisServer.getPort();
    let RedisStore = require("connect-redis")(express_session_1.default);
    let redis = new ioredis_1.default({ host: redisHost, port: redisPort });
    typeorm_data_source_1.AppDataSource.initialize()
        .then(async () => {
    })
        .catch((error) => console.log(error));
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
            maxAge: 1000 * 60 * 60 * 24 * 2,
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
                LikeResolver_1.LikeResolver,
                UploadResolver_1.UploadResolver,
            ],
            validate: false,
        }),
        csrfPrevention: true,
        cache: 'bounded',
        context: ({ req, res }) => ({
            req,
            res,
            redis,
            userLoader: (0, DataLoader_1.createUserLoader)(),
            likeLoader: (0, DataLoader_1.createLikeLoader)()
        }),
    });
    await server.start();
    app.use((0, graphql_upload_1.graphqlUploadExpress)({
        maxFileSize: 10000000,
        maxFiles: 20
    }));
    const corsOptions = {
        origin: [
            process.env.CORS_ORIGIN,
            (_a = !constants_1.__prod__) !== null && _a !== void 0 ? _a : "https://studio.apollographql.com",
        ],
        credentials: true,
    };
    server.applyMiddleware({
        app,
        cors: corsOptions,
    });
    app.use((0, cors_1.default)());
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