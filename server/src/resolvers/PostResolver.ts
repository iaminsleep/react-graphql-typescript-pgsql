import { Post } from "../entities/Post";
import { Arg, Ctx, Int, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { sleep } from "../utils/sleep";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { PostInput } from "../utils/PostInput";
import { AppDataSource } from "../typeorm-data-source";

@Resolver()
export class PostResolver {
    /** CRUD Operations Through GraphQL */
    @Query(() => [Post])
    async posts(
        @Arg('limit', () => Int) limit: number, // limit of posts
        @Arg('cursor', () => String, { nullable: true}) cursor: string | null
    ): Promise<Post[]> {
        await sleep(3000);
        // return Post.find(); // returns Promise of all posts - completion of asynchronous operation.

        const realLimit = Math.min(50, limit); // if some users wanted to change the query, this line of code won't allow this
        const queryBuilder = AppDataSource
            .getRepository(Post)
            .createQueryBuilder("pagination")
            .orderBy('"createdAt"', "DESC") // specific for typeorm and postgresql - wrap single quotes around double quotes if you want to use camelCase, otherwise "createdAt" will look like 'createdat'
            .limit(realLimit)
        if(cursor) {
            queryBuilder.where('"createdAt" < :cursor', { 
                cursor: new Date(parseInt(cursor)),
            }); // query builder allows using if statements and continue querying
        }
        return queryBuilder.getMany();
    }

    @Query(() => Post, { nullable: true }) // query can be null
    post(@Arg('id') id: number): Promise<Post | null > {
        return Post.findOne({where: {id}});
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth) // check if user is authenticated by checking the cookie in the database. simple as that.
    async createPost(
        @Arg('input') input: PostInput,
        @Ctx() { req }: MyContext
    ): Promise<Post> {
        return Post.create({
            ...input, // paste user input
            creatorId: req.session.userId // take userid from express-session (not redis database!)
        }).save(); // save() function from typeorm equivalent to MikroORM's 'persistAndFlush()'
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title', () => String, { nullable: true }) title: string, // if you want to make this field nullable
    ): Promise<Post | null> {
        const post = await Post.findOne({where: {id}});
        if(!post) return null;
        if(typeof title !== 'undefined') {
            // post.title = title;
            // await em.persistAndFlush(post); // save the data in db (MIKROORM equivalent)
            Post.update({id}, {title});
        }
        return post;
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg('id', () => Int) id: number,
    ): Promise<boolean> {
        await Post.delete(id);
        return true;
    }
}