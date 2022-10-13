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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const User_1 = require("../entities/User");
const type_graphql_1 = require("type-graphql");
const argon2_1 = __importDefault(require("argon2"));
const constants_1 = require("../constants");
const UsernamePasswordInput_1 = require("../utils/UsernamePasswordInput");
const validateRegister_1 = require("../utils/validateRegister");
const sendEmail_1 = require("../utils/sendEmail");
const uuid_1 = require("uuid");
const typeorm_data_source_1 = require("../typeorm-data-source");
const graphql_upload_1 = require("graphql-upload");
const isAuth_1 = require("../middleware/isAuth");
const path_1 = __importDefault(require("path"));
const promises_1 = require("stream/promises");
const fs_1 = __importDefault(require("fs"));
let FieldError = class FieldError {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    (0, type_graphql_1.ObjectType)()
], FieldError);
let UserResponse = class UserResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], UserResponse.prototype, "user", void 0);
UserResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], UserResponse);
function generateRandomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
let UserResolver = class UserResolver {
    email(user, { req }) {
        if (req.session.userId && req.session.userId === user.id) {
            return user.email;
        }
        return "";
    }
    user(id) {
        return User_1.User.findOne({ where: { id: id } });
    }
    async me({ req }) {
        if (!req.session.userId)
            return null;
        else {
            return User_1.User.findOne({ where: { id: req.session.userId } });
        }
    }
    async register(options) {
        const errors = (0, validateRegister_1.validateRegister)(options);
        if (errors) {
            return { errors };
        }
        const hashedPassword = await argon2_1.default.hash(options.password);
        let user;
        try {
            const result = await typeorm_data_source_1.AppDataSource.createQueryBuilder().insert().into(User_1.User).values({
                email: options.email,
                login: options.login.toLowerCase(),
                password: hashedPassword
            }).returning('*').execute();
            user = result.raw[0];
        }
        catch (err) {
            if (err.code === '23505')
                return {
                    errors: [{
                            field: 'login',
                            message: 'This login or email has already been taken.'
                        }]
                };
        }
        return { user };
    }
    async login(loginOrEmail, password, { req }) {
        const user = await User_1.User.findOne(loginOrEmail.includes('@')
            ? { where: { email: loginOrEmail } }
            : { where: { login: loginOrEmail } });
        if (!user)
            return {
                errors: [{
                        field: 'loginOrEmail',
                        message: "That user doesn't exist.",
                    }]
            };
        const valid = await argon2_1.default.verify(user.password, password);
        if (!valid)
            return {
                errors: [{
                        field: 'password',
                        message: "Incorrect password.",
                    }]
            };
        req.session.userId = user.id;
        return { user };
    }
    async logout({ req, res }) {
        return new Promise((resolve) => req.session.destroy((err) => {
            res.clearCookie(constants_1.COOKIE_NAME);
            if (err) {
                resolve(false);
                return;
            }
            resolve(true);
        }));
    }
    async updateUser(username, email, file, { req }) {
        const user = await User_1.User.findOne({ where: { id: req.session.userId } });
        if (!user)
            return {
                errors: [{
                        field: 'login',
                        message: "User not found.",
                    }]
            };
        let newFilename = null;
        if (typeof file !== 'undefined' && file !== null) {
            const { createReadStream, filename } = file;
            const { ext } = path_1.default.parse(filename);
            newFilename = generateRandomString(12) + ext;
            const stream = createReadStream();
            const pathName = path_1.default.join(__dirname, `../../../client/public/img/post/${newFilename}`);
            const out = require('fs').createWriteStream(pathName);
            stream.pipe(out);
            await (0, promises_1.finished)(out);
            if (user.avatar) {
                const pathName = path_1.default.join(__dirname, `../../../client/public/img/post/${user.avatar}`);
                fs_1.default.unlinkSync(pathName);
            }
        }
        else if (file === null && typeof file !== 'undefined' && user.avatar) {
            const pathName = path_1.default.join(__dirname, `../../../client/public/img/post/${user.avatar}`);
            fs_1.default.unlinkSync(pathName);
        }
        const queryResult = await typeorm_data_source_1.AppDataSource
            .createQueryBuilder()
            .update(User_1.User)
            .set({ username, email,
            avatar: (file === null ? null :
                newFilename !== null ? newFilename :
                    file === undefined && newFilename === null ? user.avatar : null) })
            .where('id = :id', {
            id: req.session.userId
        })
            .returning("*")
            .execute();
        return queryResult.raw[0];
    }
    async forgotPassword(email, { redis }) {
        const user = await User_1.User.findOne({ where: { email: email } });
        if (!user) {
            return true;
        }
        const token = (0, uuid_1.v4)();
        await redis.set(constants_1.FORGET_PASSWORD_PREFIX + token, user.id, 'EX', 1000 * 60 * 60 * 24 * 2);
        await (0, sendEmail_1.sendEmail)(email, `<a href="${process.env.CORS_ORIGIN}/change-password/${token}">Click this link to reset your password</a>`);
        return true;
    }
    async changePassword(token, newPassword, { req, redis }) {
        if (newPassword.length <= 4) {
            return { errors: [{ field: 'newPassword', message: 'Password length must be greater than 4.' }]
            };
        }
        const key = constants_1.FORGET_PASSWORD_PREFIX + token;
        const userId = await redis.get(key);
        if (!userId) {
            return { errors: [{ field: "token", message: "Expired token" }]
            };
        }
        const userIdNum = parseInt(userId);
        const user = await User_1.User.findOne({ where: { id: userIdNum } });
        if (!user) {
            return { errors: [{ field: "token", message: "User no longer exists" }]
            };
        }
        User_1.User.update({ id: userIdNum }, { password: await argon2_1.default.hash(newPassword) });
        await redis.del(key);
        req.session.userId = user.id;
        return { user };
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "email", null);
__decorate([
    (0, type_graphql_1.Query)(() => User_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "user", null);
__decorate([
    (0, type_graphql_1.Query)(() => User_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "me", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)('options', () => UsernamePasswordInput_1.UsernamePasswordInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UsernamePasswordInput_1.UsernamePasswordInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)('loginOrEmail')),
    __param(1, (0, type_graphql_1.Arg)('password')),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "logout", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('username', { nullable: true })),
    __param(1, (0, type_graphql_1.Arg)('email', { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)('file', () => graphql_upload_1.GraphQLUpload, { nullable: true })),
    __param(3, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updateUser", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)('email')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "forgotPassword", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)('token')),
    __param(1, (0, type_graphql_1.Arg)('newPassword')),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "changePassword", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)(User_1.User)
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=UserResolver.js.map