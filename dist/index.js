"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const constants_2 = require("./constants");
require("reflect-metadata");
const core_1 = require("@mikro-orm/core");
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const express_session_1 = __importDefault(require("express-session"));
const redis_1 = require("redis");
const HelloResolver_1 = require("./resolvers/HelloResolver");
const PostResolver_1 = require("./resolvers/PostResolver");
const UserResolver_1 = require("./resolvers/UserResolver");
const main = async () => {
    const orm = await core_1.MikroORM.init(mikro_orm_config_1.default);
    await orm.getMigrator().up();
    const app = (0, express_1.default)();
    const port = constants_2.__port__ || 8080;
    let RedisStore = require("connect-redis")(express_session_1.default);
    let redisClient = (0, redis_1.createClient)({ legacyMode: true });
    redisClient.connect().catch(console.error);
    app.use((0, express_session_1.default)({
        name: "qid",
        store: new RedisStore({ client: redisClient }),
        saveUninitialized: false,
        secret: "expressjsapollographqlredismikroorm",
        resave: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            secure: constants_1.__prod__,
            sameSite: 'lax',
        }
    }));
    const server = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [HelloResolver_1.HelloResolver, PostResolver_1.PostResolver, UserResolver_1.UserResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({ em: orm.em, req, res }),
    });
    await server.start();
    server.applyMiddleware({
        app,
        cors: {
            credentials: true,
        },
    });
    app.listen(port, () => {
        console.log('Server started on localhost: 4444');
        console.log('Press Ctrl+C to exit');
    });
};
main().catch((err) => {
    console.log(err);
});
//# sourceMappingURL=index.js.map