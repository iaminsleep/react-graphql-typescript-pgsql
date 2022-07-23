import { __prod__ } from "./constants";

import { Options } from "@mikro-orm/core";
import path from 'path';

import { Post } from "./entities/Post";

const config: Options = {
    migrations: {
        path: path.join(__dirname, './migrations'),
        glob: '!(*.d).{js,ts}',
    },
    entities: [Post],
    dbName: 'twitter',
    user: 'postgres',
    password: 'password',
    type: 'postgresql',
    debug: !__prod__,
}

export default config;