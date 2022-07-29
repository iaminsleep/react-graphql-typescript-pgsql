import { DataSource } from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';
import path from 'path';

export const AppDataSource = new DataSource({
    type: 'postgres',
    database: 'twitter',
    username: 'postgres',
    password: 'password',
    port: 5432,
    logging: true,
    synchronize: true, // synchronize: true migrates automatically at the start
    migrations: [path.join(__dirname, './migrations/*{.ts,.js}')],
    entities: [Post, User],
});

// to initialize initial connection with the database, register all entities
// and "synchronize" database schema, call "initialize()" method of a newly created database
// once in your application bootstrap
AppDataSource.initialize()
    .then(() => {
        // here you can start to work with your database
        // AppDataSource.runMigrations(); to run migrations in index.ts
    })
    .catch((error) => console.log(error))