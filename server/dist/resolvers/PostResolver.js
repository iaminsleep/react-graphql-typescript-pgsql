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
exports.PostResolver = void 0;
const Post_1 = require("../entities/Post");
const type_graphql_1 = require("type-graphql");
const isAuth_1 = require("../middleware/isAuth");
const PostInput_1 = require("../utils/PostInput");
const typeorm_data_source_1 = require("../typeorm-data-source");
const User_1 = require("../entities/User");
let PaginatedPosts = class PaginatedPosts {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Post_1.Post]),
    __metadata("design:type", Array)
], PaginatedPosts.prototype, "posts", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PaginatedPosts.prototype, "hasMore", void 0);
PaginatedPosts = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedPosts);
let PostResolver = class PostResolver {
    textSnippet(post) {
        return post.text.slice(0, 50);
    }
    postCreationDateString(post) {
        return Intl.DateTimeFormat(undefined, {
            year: "numeric",
            day: "numeric",
            month: "long",
            hour: "numeric",
            minute: "numeric",
        }).format(post.createdAt);
    }
    creator(post, { userLoader }) {
        return userLoader.load(post.creatorId);
    }
    async voteStatus(post, { likeLoader, req }) {
        if (!req.session.userId)
            return null;
        const like = await likeLoader.load({
            postId: post.id,
            userId: req.session.userId
        });
        if (like)
            return 1;
        else
            return 0;
    }
    async posts(limit, cursor, searchBy, userId, { req }) {
        const realLimit = Math.min(50, limit);
        const limitPaginationNumber = realLimit + 1;
        const replacements = [limitPaginationNumber];
        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
        }
        const posts = await typeorm_data_source_1.AppDataSource.query(`
            select p.*
            from post p
            ${searchBy === "LIKED"
            ? `join "like" lk on lk."postId" = p.id WHERE lk."userId" = ${req.session.userId}`
            : ''}
            ${cursor
            ? 'where p."createdAt" < $2'
            : ''}
            ${userId
            ? `where p."creatorId" = ${userId}`
            : ''}
            ${searchBy === "LIKES_COUNT" ? 'order by p.likes_count DESC' : 'order by p."createdAt" DESC'}
            limit $1
        `, replacements);
        return {
            posts: posts.slice(0, realLimit),
            hasMore: posts.length === limitPaginationNumber,
        };
    }
    post(id) {
        return Post_1.Post.findOne({
            where: { id },
        });
    }
    async createPost(input, { req }) {
        const queryRunner = typeorm_data_source_1.AppDataSource.createQueryRunner();
        var result = await queryRunner.manager.query(`SELECT max(id) FROM post`);
        const lastId = result[0].max;
        return Post_1.Post.create(Object.assign(Object.assign({ id: lastId + 1 }, input), { creatorId: req.session.userId })).save();
    }
    async updatePost(id, text, image, { req }) {
        const post = await Post_1.Post.findOne({ where: { id } });
        if (!post)
            return null;
        else if (typeof text === 'undefined')
            return null;
        else {
            const queryResult = await typeorm_data_source_1.AppDataSource
                .createQueryBuilder()
                .update(Post_1.Post)
                .set({ text, image })
                .where('id = :id and "creatorId" = :creatorId', {
                id, creatorId: req.session.userId
            })
                .returning("*")
                .execute();
            return queryResult.raw[0];
        }
    }
    async deletePost(id, { req }) {
        const currentUserId = req.session.userId;
        await Post_1.Post.delete({
            id,
            creatorId: currentUserId
        });
        return true;
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "textSnippet", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "postCreationDateString", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => User_1.User),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post, Object]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "creator", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => type_graphql_1.Int, { nullable: true }),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "voteStatus", null);
__decorate([
    (0, type_graphql_1.Query)(() => PaginatedPosts),
    __param(0, (0, type_graphql_1.Arg)('limit', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('cursor', () => String, { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)('searchBy', () => String, { nullable: true })),
    __param(3, (0, type_graphql_1.Arg)('userId', () => type_graphql_1.Int, { nullable: true })),
    __param(4, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "posts", null);
__decorate([
    (0, type_graphql_1.Query)(() => Post_1.Post, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "post", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('input')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PostInput_1.PostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('text')),
    __param(2, (0, type_graphql_1.Arg)('image', { nullable: true })),
    __param(3, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
PostResolver = __decorate([
    (0, type_graphql_1.Resolver)(Post_1.Post)
], PostResolver);
exports.PostResolver = PostResolver;
//# sourceMappingURL=PostResolver.js.map