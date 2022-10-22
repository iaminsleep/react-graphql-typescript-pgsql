import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, FieldResolver, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { EmailPasswordInput } from "../utils/EmailPasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from 'uuid';
import { AppDataSource } from "../typeorm-data-source"; // config
import { FileUpload, GraphQLUpload } from "graphql-upload";
import { isAuth } from "../middleware/isAuth";
import path from 'path';
import { finished } from 'stream/promises';
import fs from 'fs';

@ObjectType() // GraphQL object
class FieldError {
    @Field()
    field: string; // if something is wrong with particular field, it chooses this field
    @Field()
    message: string;
}

@ObjectType() // GraphQL object
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]; // question mark because it returns either user or error, the second one will be null

    @Field(() => User, { nullable: true })
    user?: User;
}

@ObjectType() // GraphQL object
class ForgotPasswordResponse {
    @Field(() => String, { nullable: true })
    url?: String | null;
}

function generateRandomString(length: number) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

@Resolver(User)
export class UserResolver {
    // Field Resolver logic to not show users emails when fetching posts and getting the creator
    @FieldResolver(() => String)
    email(@Root() user: User, @Ctx() { req }: MyContext) {
        // if this is the current user then it's okay to show them their own email
        if(req.session.userId && req.session.userId === user.id) {
            return user.email;
        }
        // prevents from user see someone else's email
        return "";
    }

    @Query(() => User, { nullable: true })
    user(
        @Arg('id', () => Int) id: number,
    ) : Promise<User | null> {
        return User.findOne({ where: { id: id } });
    }

    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { req }: MyContext,
    ): Promise<User | null> {
        // return null if you are not logged in
        if(!req.session.userId) return null;
        else {
            // else find user by id that is stored in cookie
            return User.findOne(
                { where: { id: req.session.userId } }
            );
        }
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options', () => EmailPasswordInput) options: EmailPasswordInput, // use the options object, also you can specify what exactly you pass if you receieve an error
    ): Promise<UserResponse> {
        const errors = validateRegister(options);
        if(errors) {
            return { errors }; // return error from response. change the shape of error response
        }

        const hashedPassword = await argon2.hash(options.password);
        let user;
        try {
            const result = await AppDataSource.createQueryBuilder().insert().into(User).values({
                email: options.email,
                login: options.login.toLowerCase(),
                password: hashedPassword
            }).returning('*').execute(); // * clause to return user object
            user = result.raw[0]; // the whole code here is if you want to use query builder instead of easy User.create({email: options.email,username: options.username,password: hashedPassword}) function

        } catch (err) {
            // duplicate login or email error
            if(err.code === '23505') return  {
                errors: [{ 
                    field: 'login', 
                    message: 'This login or email has already been taken.'
                }]
            }
        }

        return { user }; // return user in the object
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('loginOrEmail') loginOrEmail: string,
        @Arg('password') password: string,
        @Ctx() { req }: MyContext,
    ): Promise<UserResponse> {
        const user = await User.findOne(
            loginOrEmail.includes('@') 
            ? { where: { email: loginOrEmail }}
            :  { where: { login: loginOrEmail }}
        ); // conditionally find user either by email or login

        if(!user) return { 
            errors: [{
                field: 'loginOrEmail',
                message: "That user doesn't exist.",
            }]
        } // error if user was not found by name

        const valid = await argon2.verify(user.password, password); // verify hashed user password with plain text password from graphql argument
        if(!valid) return {
            errors: [{
                field: 'password',
                message: "Incorrect password.",
            }]
        }

        // if user is found and password is correct, session cookie is stored with user id to know who the authenticated user is. this will set a cookie on the user & keep them logged in until cookie is expired or deleted.
        req.session!.userId = user.id;
        
        return { user };  // if user is found and password is correct, user object is returned
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async logout(
        @Ctx() { req, res }: MyContext
    ) {
        // wait for the destroy callback. then wait for promise to be resolved
        return new Promise((resolve) => 
            req.session.destroy((err) => {
                // clear cookie from browser
                res.clearCookie(COOKIE_NAME);
                // callback. clear cookie from redis
                if(err) {
                    resolve(false)
                    return
                } 
                // success
                resolve(true);
            })
        );
    }

    @Mutation(() => UserResponse)
    @UseMiddleware(isAuth)
    async updateUser(
        @Arg('username', { nullable: true }) username: string,
        @Arg('email', { nullable: true }) email: string,
        @Arg('password') password: string,
        @Arg('file', () => GraphQLUpload, { nullable: true }) file: FileUpload,
        @Ctx() { req }: MyContext,
    ): Promise<UserResponse> {
        const oldUser = await User.findOne({ where: { id: req.session.userId } });

        // user found confirmation
        if(!oldUser) return {
            errors: [{
                field: 'username',
                message: "User not found.",
            }]
        };
        // password match confirmation
        const valid = await argon2.verify(oldUser.password, password); // verify hashed user password with plain text password from graphql argument
        if(!valid) return {
            errors: [{
                field: 'password',
                message: "Incorrect password.",
            }]
        }
        // email field validation
        if(!email.includes('@')) { 
                return { errors: [{ 
                    field: 'email', 
                    message: 'Invalid email'
                }] 
            };
        }
        // password field validation
        if(password.length <= 4) { 
            return { errors: [{ 
                    field: 'password', 
                    message: 'Password length must be greater than 4.'
                }] 
            };
        }

        let newFilename = null;
            
        if(typeof file !== 'undefined' && file !== null) {
            const { createReadStream, filename } = file;

            const { ext } = path.parse(filename);
            newFilename = generateRandomString(12) + ext;
            const stream = createReadStream();

            const pathName = path.join(__dirname, `../../../client/public/img/avatar/${newFilename}`);

            const out = require('fs').createWriteStream(pathName);
            stream.pipe(out);
            await finished(out);

            if(oldUser.avatar) {
                const pathName = path.join(__dirname, `../../../client/public/img/avatar/${oldUser.avatar}`);
                if (fs.existsSync(pathName)) {
                    // path exists
                    fs.unlinkSync(pathName);
                }
            }
        } else if (file === null && typeof file !== 'undefined' && oldUser.avatar) {
            const pathName = path.join(__dirname, `../../../client/public/img/avatar/${oldUser.avatar}`);
            if (fs.existsSync(pathName)) {
                // path exists
                fs.unlinkSync(pathName);
            }
        }

        let user;
        try { 
            const queryResult = await AppDataSource
                .createQueryBuilder()
                .update(User)
                .set({  username, email,
                        avatar: ( 
                            file === null ? null :
                            newFilename !== null ? newFilename : 
                            file === undefined && newFilename === null ? oldUser.avatar : null
                        )})
                .where('id = :id', { 
                    id: req.session.userId 
                })
                .returning("*")
                .execute();
            user = queryResult.raw[0];
        } catch (err) {
            if(err.code === '23505') return { // duplicate email error
                errors: [{ 
                    field: 'email', 
                    message: 'This email already exists in the database.'
                }]
            }
        }

        return { user }; // return user in the object
    }

    @Mutation(() => ForgotPasswordResponse)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { redis } : MyContext
    ): Promise<ForgotPasswordResponse> {
        const user = await User.findOne(
            { where: { email: email } }
        ); // email is not primary key, that's why we need to specify it when searching
        if(!user) {
            // the email is not in the db
            return { url: null }; // the reason for this is security, because realistically you don't want for user to fetch the entire database and let him know which email exists and which is not.
        }

        // generate token
        const token = v4(); // generate token using uuid lib
        await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, 'EX', 1000 * 60 * 60 * 24); // store the token inside redis database that will look like: 'forget-password:qeioe-rwetg423-dsd-dsf', expires after 1 day

        const emailUrl = await sendEmail(email, 
            `<a href="${process.env.CORS_ORIGIN}/change-password/${token}">Click on this link to reset your password</a>`
        ) as string;

        return { url: emailUrl }; // return true anyway
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() { req, redis }: MyContext
    ): Promise<UserResponse> {
        // password field validation
        if(newPassword.length <= 4) { 
            return { errors: [{ field: 'newPassword', message: 'Password length must be greater than 4.'}]
            };
        }

        // after veryfing password check if the token is right
        const key = FORGET_PASSWORD_PREFIX + token;
        const userId = await redis.get(key);
        if(!userId) {
            return { errors: [{ field: "token", message: "Expired token" }]
            }
        }

        // rare occasion if user was not found in db
        const userIdNum = parseInt(userId);
        const user = await User.findOne(
            { where: { id: userIdNum }}
        );
        if(!user) {
            return { errors: [{ field: "token", message: "User no longer exists" }]
            }
        }

        // hash the password and save in the database
        // await em.fork().persistAndFlush(user);
        User.update(
            { id: userIdNum }, 
            { password: await argon2.hash(newPassword) }
        );

        // remove token from redis so you can't change password again
        await redis.del(key);

        // login user after changing password
        req.session.userId = user.id;

        return { user };
    }
}