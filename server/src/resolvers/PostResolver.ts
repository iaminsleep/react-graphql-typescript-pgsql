import { Post } from "../entities/Post";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { MyContext } from "src/types";
import { RequestContext } from "@mikro-orm/core";

@Resolver()
export class PostResolver {
    /** CRUD Operations Through GraphQL */
    @Query(() => [Post])
    posts(
        @Ctx() { em }: MyContext
    ): Promise<Post[]> {
        return em.fork().find(Post, {}); // returns Promise of posts - completion of asynchronous operation.
    }

    @Query(() => Post, { nullable: true }) // query can be null
    post(
        @Arg('id', () => Int) id: number,
        @Ctx() {em}: MyContext
    ): Promise<Post | null> { // returns post or null if not found
        return em.fork().findOne(Post, { id }); // you need to type 'where: id' if findOne is not set.
    }

    @Mutation(() => Post)
    async createPost(
        @Arg('title') title: string,
        @Ctx() {em}: MyContext
    ): Promise<Post> {
        return await RequestContext.createAsync(em, async () => {
            // inside this handler the `orm.em` will actually use the contextual fork, created via `RequestContext.createAsync()`
            const post = em.create(Post, { title });
            await em.persistAndFlush(post);
            return post;
        });
    }

    @Mutation(() => Post)
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title', () => String, { nullable: true }) title: string, // if you want to make this field nullable
        @Ctx() {em}: MyContext
    ): Promise<Post | null> {
        return await RequestContext.createAsync(em, async () => {
            const post = await em.findOne(Post, { id });
            if(!post) return null;
            if(typeof title !== 'undefined') {
                post.title = title;
                await em.persistAndFlush(post); // save the data in db
            }
            return post;
        });
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id', () => Int) id: number,
        @Ctx() {em}: MyContext
    ): Promise<boolean> {
        return await RequestContext.createAsync(em, async () => {
            try {
                em.nativeDelete(Post, { id });
            } catch {
                return false;
            }
            return true;
        });
    }
}