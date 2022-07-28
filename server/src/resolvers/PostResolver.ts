import { Post } from "../entities/Post";
import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";
import { sleep } from "../utils/sleep";

@Resolver()
export class PostResolver {
    /** CRUD Operations Through GraphQL */
    @Query(() => [Post])
    async posts(): Promise<Post[]> {
        await sleep(3000);
        return Post.find(); // returns Promise of posts - completion of asynchronous operation.
    }

    @Query(() => Post, { nullable: true }) // query can be null
    post(@Arg('id') id: number): Promise<Post | null > {
        return Post.findOne({where: {id}});
    }

    @Mutation(() => Post)
    async createPost(
        @Arg('title') title: string,
    ): Promise<Post> {
        return Post.create({title}).save(); // save() function from typeorm equivalent to MikroORM's 'persistAndFlush()'
    }

    @Mutation(() => Post)
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
    async deletePost(
        @Arg('id', () => Int) id: number,
    ): Promise<boolean> {
        await Post.delete(id);
        return true;
    }
}