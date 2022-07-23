import "reflect-metadata";
import { __prod__ } from "./constants";

import { MikroORM, RequestContext } from "@mikro-orm/core";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

import MikroORMConfig from "./mikro-orm.config";
// import { Post } from "./entities/Post";
import { HelloResolver } from "./resolvers/HelloResolver";
import { PostResolver } from "./resolvers/PostResolver";

const main = async() => {
    const orm = await MikroORM.init(MikroORMConfig);
    await orm.getMigrator().up();

    // run things in the `RequestContext` handler
    await RequestContext.createAsync(orm.em, async () => {
        // inside this handler the `orm.em` will actually use the contextual fork, created via `RequestContext.createAsync()`

        // const post = orm.em.create(Post, {
        //     title: "my first post",
        // });
        // await orm.em.persistAndFlush(post);
    });

    const app = express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver],
            validate: false,
        }),
        context: () => ({ em: orm.em }) // function that returns object for context
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app });

    // app.get('/', (req, res) => { // to ignore req or res use _ instead
    //     res.send('Hello there!');
    // }); if Apollo Graphql wasn't used in the project
    app.listen(4444, () => {
        console.log('Server started on localhost: 4444')
    });
}

main().catch((err) => {
    console.log(err);
}); 