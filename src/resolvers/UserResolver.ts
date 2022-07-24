import { RequestContext } from "@mikro-orm/core";
import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Int, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from "argon2";

@InputType()
class UsernamePasswordInput { // set the object class to use later in @Arg variables
    @Field()
    username: string;
    @Field(() => String) // if you want to overwrite the type that we explicitly set
    password: string;
}

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

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    user(
        @Arg('id', () => Int) id: number,
        @Ctx() { em }: MyContext,
    ) : Promise<User | null> {
        return em.fork().findOne(User, { id });
    }

    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { em, req }: MyContext,
    ) : Promise<User | null> {
        // return null if you are not logged in
        if(!req.session.userId) return null;
        // else find user by id that is stored in cookie
        const user = await em.fork().findOne(User, { id: req.session.userId });
        return user
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput, // use the options object, also you can specify what exactly you pass if you receieve an error
        @Ctx() { em }: MyContext,
    ): Promise<UserResponse> {
        return await RequestContext.createAsync(em, async() => {
            // username field validation
            if(options.username.length <= 2) return {
                errors: [{ 
                    field: 'username', 
                    message: 'Username length must be greater than 2.'
                }]
            }
            // password field validation
            if(options.password.length <= 4) return {
                errors: [{ 
                    field: 'username', 
                    message: 'Password length must be greater than 4.'
                }]
            }

            const hashedPassword = await argon2.hash(options.password);
            const user = em.create(User, {
                username: options.username,
                password: hashedPassword
            });

            try {
                await em.persistAndFlush(user); // try to execute these commands, otherwise throw errors depending on the error code
            } catch (err) {
                // duplicate username error
                if(err.code === '23505') return  {
                    errors: [{ 
                        field: 'username', 
                        message: 'This username has already been taken.'
                    }]
                }
            }

            return { user }; // return user in the object
        })
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput, // use the options object, also you can specify what exactly you pass if you receieve an error
        @Ctx() { em, req }: MyContext,
    ): Promise<UserResponse> {
        return await RequestContext.createAsync(em, async() => {
            const user = await em.findOne(User, { username: options.username.toLowerCase() });
            if(!user) return { 
                errors: [{
                    field: 'username',
                    message: "That username doesn't exist.",
                }]
            } // error if user was not found by name

            const valid = await argon2.verify(user.password, options.password); // verify hashed user password with plain text password from graphql argument
            if(!valid) return {
                errors: [{
                    field: 'password',
                    message: "Incorrect password.",
                }]
            }

            // if user is found and password is correct, session cookie is stored with user id to know who the authenticated user is. this will set a cookie on the user & keep them logged in until cookie is expired or deleted.
            req.session!.userId = user.id;

            return {
                user, // if user is found and password is correct, user object is returned
            };
        })
    }
}