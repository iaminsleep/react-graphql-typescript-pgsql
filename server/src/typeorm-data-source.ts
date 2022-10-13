require('dotenv').config();

import { DataSource } from 'typeorm';
import path from 'path';

import { Post } from './entities/Post';
import { User } from './entities/User';
import { Like } from './entities/Like';

import { __prod__ } from './constants';

export const AppDataSource = new DataSource({
    type: 'postgres',
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    port: Number(process.env.DATABASE_PORT),
    logging: true,
    synchronize: !__prod__, // synchronize: true migrates automatically at the start
    migrations: [path.join(__dirname, './migrations/*{.ts,.js}')],
    entities: [Like, Post, User],
});