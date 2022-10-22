"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockData1666187745326 = void 0;
const argon2_1 = __importDefault(require("argon2"));
class MockData1666187745326 {
    async up(queryRunner) {
        await queryRunner.query(`
            insert into "user" (email, login, password, username, avatar) 
            values ('brock@gmail.com', 'brock', '${await argon2_1.default.hash('brock1')}', 'brock', 'brock.jpg')
        `);
        await queryRunner.query(`
            insert into "user" (email, login, password, username, avatar) 
            values ('gogol@gmail.com', 'gogol', '${await argon2_1.default.hash('gogol2')}', 'gogol', 'gogol.jpg')
        `);
        await queryRunner.query(`
            insert into "user" (email, login, password, username, avatar) 
            values ('mary@gmail.com', 'mary', '${await argon2_1.default.hash('mary3')}', 'mary', 'mary.jpg')
        `);
        await queryRunner.query(`
            insert into "user" (email, login, password, username, avatar) 
            values ('raamin@gmail.com', 'raamin', '${await argon2_1.default.hash('raamin4')}', 'raamin', 'raamin.jpg')
        `);
        await queryRunner.query(`
            insert into "user" (email, login, password, username, avatar) 
            values ('vasil@gmail.com', 'vasil', '${await argon2_1.default.hash('vasil5')}', 'vasil', 'vasil.jpg')
        `);
        await queryRunner.query(`
            insert into "user" (email, login, password, username, avatar) 
            values ('winston@gmail.com', 'winston', '${await argon2_1.default.hash('winston6')}', 'winston', 'winston.jpg')
        `);
        await queryRunner.query(`
            insert into post (text, likes_count, image, "creatorId") 
            values ('What a wonderful night!', 316, 'wonderful_night.jpg', 1)
        `);
        await queryRunner.query(`
            insert into post (text, likes_count, image, "creatorId") 
            values ('These are my most prized possessions. I won''t tell what they are, but they fill a room.', 204, 'collection.jpg', 2)
        `);
        await queryRunner.query(`
            insert into post (text, likes_count, image, "creatorId") 
            values ('How many times can I say tired in this tweet? Trick question, the answer is as many times as I want because I''m tired.', 216, null, 3)
        `);
        await queryRunner.query(`
            insert into post (text, likes_count, image, "creatorId") 
            values ('I''m gonna build a really, really big wooden bridge. And it's gonna be great.', 1124, 'wooden_bridge.jpg', 4)
        `);
        await queryRunner.query(`
            insert into post (text, likes_count, image, "creatorId") 
            values ('it''s time to make some changes to your life and say goodbye to the things that hold you back from being the best version of yourself', 2559, null, 5)
        `);
        await queryRunner.query(`
            insert into post (text, likes_count, image, "creatorId") 
            values ('When the mountain takes a break, it''s time to take a break too.', 437, 'mountain_climb.jpg', 6)
        `);
    }
    async down(_) {
    }
}
exports.MockData1666187745326 = MockData1666187745326;
//# sourceMappingURL=1666187745326-StartingData.js.map