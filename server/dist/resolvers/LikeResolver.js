"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeResolver = void 0;
const isAuth_1 = require("../middleware/isAuth");
const typeorm_data_source_1 = require("../typeorm-data-source");
const type_graphql_1 = require("type-graphql");
const Like_1 = require("../entities/Like");
class LikeResolver {
    async like(postId, { req }) {
        const { userId } = req.session;
        const like = await Like_1.Like.findOne({ where: { postId, userId } });
        if (like) {
            await typeorm_data_source_1.AppDataSource.transaction(async (transactionManager) => {
                await transactionManager.query(`
                    delete from "like"
                    where "userId" = $1 and "postId" = $2;
                `, [userId, postId]);
                await transactionManager.query(`
                    update post 
                    set likes_count = likes_count - 1
                    where id = $1;
                `, [postId]);
            });
        }
        else if (!like) {
            await typeorm_data_source_1.AppDataSource.transaction(async (transactionManager) => {
                await transactionManager.query(`
                    insert into "like" ("userId", "postId")
                    values ($1, $2);
                `, [userId, postId]);
                await transactionManager.query(`
                    update post 
                    set likes_count = likes_count + 1
                    where id = $1;
                `, [postId]);
            });
        }
        return true;
    }
}
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('postId', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], LikeResolver.prototype, "like", null);
exports.LikeResolver = LikeResolver;
//# sourceMappingURL=LikeResolver.js.map