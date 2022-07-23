import { Post } from "../entities/Post";
import { Arg, Ctx, Int, Query, Resolver } from "type-graphql";
import { MyContext } from "src/types";

@Resolver()
export class PostResolver {

    @Query(() => [Post])
    posts(
        @Ctx() {em}: MyContext
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
}