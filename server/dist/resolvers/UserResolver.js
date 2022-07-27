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
const core_1 = require("@mikro-orm/core");
const User_1 = require("../entities/User");
const type_graphql_1 = require("type-graphql");
const argon2_1 = __importDefault(require("argon2"));
const constants_1 = require("../constants");
const UsernamePasswordInput_1 = require("../utils/UsernamePasswordInput");
const validateRegister_1 = require("../utils/validateRegister");
const sendEmail_1 = require("../utils/sendEmail");
const uuid_1 = require("uuid");
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
let UserResolver = class UserResolver {
    user(id, { em }) {
        return em.fork().findOne(User_1.User, { id });
    }
    async me({ em, req }) {
        if (!req.session.userId)
            return null;
        else {
            const user = await em.fork().findOne(User_1.User, { id: req.session.userId });
            return user;
        }
    }
    async register(options, { em }) {
        return await core_1.RequestContext.createAsync(em, async () => {
            const errors = (0, validateRegister_1.validateRegister)(options);
            if (errors) {
                return { errors };
            }
            const hashedPassword = await argon2_1.default.hash(options.password);
            const user = em.create(User_1.User, {
                email: options.email,
                username: options.username,
                password: hashedPassword
            });
            try {
                await em.persistAndFlush(user);
            }
            catch (err) {
                if (err.code === '23505')
                    return {
                        errors: [{
                                field: 'username',
                                message: 'This username has already been taken.'
                            }]
                    };
            }
            return { user };
        });
    }
    async login(usernameOrEmail, password, { em, req }) {
        return await core_1.RequestContext.createAsync(em, async () => {
            const user = await em.findOne(User_1.User, usernameOrEmail.includes('@')
                ? { email: usernameOrEmail.toLowerCase() }
                : { username: usernameOrEmail.toLowerCase()
                });
            if (!user)
                return {
                    errors: [{
                            field: 'usernameOrEmail',
                            message: "That username doesn't exist.",
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
            return {
                user,
            };
        });
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
    forgotPassword(email, { em, redis }) {
        return core_1.RequestContext.createAsync(em, async () => {
            const user = await em.findOne(User_1.User, { email });
            if (!user) {
                return true;
            }
            const token = (0, uuid_1.v4)();
            await redis.set(constants_1.FORGET_PASSWORD_PREFIX + token, user.id, 'EX', 1000 * 60 * 60 * 24 * 2);
            await (0, sendEmail_1.sendEmail)(email, `<a href="http://localhost:3000/change-password/${token}">Click this link to reset your password</a>`);
            return true;
        });
    }
    async changePassword(token, newPassword, { em, req, redis }) {
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
        const user = await em.fork().findOne(User_1.User, { id: userId });
        if (!user) {
            return { errors: [{ field: "token", message: "User no longer exists" }]
            };
        }
        user.password = await argon2_1.default.hash(newPassword);
        await em.fork().persistAndFlush(user);
        await redis.del(key);
        req.session.userId = user.id;
        return { user };
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => User_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
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
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UsernamePasswordInput_1.UsernamePasswordInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)('usernameOrEmail')),
    __param(1, (0, type_graphql_1.Arg)('password')),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "logout", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)('email')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
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
    (0, type_graphql_1.Resolver)()
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=UserResolver.js.map