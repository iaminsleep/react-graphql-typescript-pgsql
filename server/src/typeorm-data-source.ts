import { DataSource } from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';
import path from 'path';
import { Upvote } from './entities/Upvote';
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
    entities: [Post, User, Upvote],
});

// to initialize initial connection with the database, register all entities
// and "synchronize" database schema, call "initialize()" method of a newly created database
// once in your application bootstrap
AppDataSource.initialize()
    .then(() => {
        // here you can start to work with your database
        AppDataSource.runMigrations(); //to run migrations in index.ts
        // User.delete({});
        // Post.delete({});
    })
    .catch((error) => console.log(error))