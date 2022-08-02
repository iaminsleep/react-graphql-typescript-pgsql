"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
const path_1 = __importDefault(require("path"));
const Upvote_1 = require("./entities/Upvote");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    database: 'twitter',
    username: 'postgres',
    password: 'password',
    port: 5432,
    logging: true,
    synchronize: true,
    migrations: [path_1.default.join(__dirname, './migrations/*{.ts,.js}')],
    entities: [Post_1.Post, User_1.User, Upvote_1.Upvote],
});
exports.AppDataSource.initialize()
    .then(() => {
})
    .catch((error) => console.log(error));
//# sourceMappingURL=typeorm-data-source.js.map