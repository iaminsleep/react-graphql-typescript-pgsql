"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    database: 'twitter',
    username: 'postgres',
    password: 'password',
    port: 5432,
    logging: true,
    synchronize: true,
    entities: [Post_1.Post, User_1.User],
});
exports.AppDataSource.initialize()
    .then(() => {
})
    .catch((error) => console.log(error));
//# sourceMappingURL=typeorm-data-source.js.map