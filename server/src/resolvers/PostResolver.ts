import { Post } from "../entities/Post";
import { Arg, Ctx, Field, FieldResolver, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { sleep } from "../utils/sleep";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { PostInput } from "../utils/PostInput";
import { AppDataSource } from "../typeorm-data-source";
// import { Upvote } from "../entities/Upvote";

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post]) // specify what does the field return
    posts: Post[] // return an array of posts
    @Field()
    hasMore: boolean; // helps define if there are any posts left
}

// speicfy what we are resolving 
@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet(@Root() root: Post) {
        return root.text.slice(0, 50);
    }

    /** CRUD Operations Through GraphQL */
    @Query(() => PaginatedPosts)
    async posts(
        @Arg('limit', () => Int) limit: number, // limit of posts
        @Arg('cursor', () => String, { nullable: true}) cursor: string | null,
        @Ctx() { req }: MyContext
    ): Promise<PaginatedPosts> {
        await sleep(3000); // keep for fun, impacts delete post speed
        // return Post.find(); // returns Promise of ALL posts - completion of asynchronous operation.

        // 100 -> 101 make the query take 1 more post than usual to check if there are posts left
        const realLimit = Math.min(50, limit); // if some users wanted to change the query, this line of code won't allow this
        const limitPaginationNumber = realLimit + 1;

        const replacements: any[] = [limitPaginationNumber];
 
        if(req.session.userId) {
            replacements.push(req.session.userId);
        }

        let cursorIndex;
        if(cursor) {
            replacements.push(new Date(parseInt(cursor)));
            cursorIndex = replacements.length;
        }

        const posts = await AppDataSource.query(`
            select p.*, json_build_object(
                'id', u.id,
                'username', u.username,
                'email', u.email
            ) creator, 
            ${
                req.session.userId 
                    ? '(select value from upvote where "userId" = $2 and "postId" = p.id) "voteStatus"'
                    : 'null as "voteStatus"'
            }
            from post p
            inner join public.user u on u.id = p."creatorId"
            ${cursor 
                ? `where p."createdAt" < $${cursorIndex}` 
                : ''
            }
            order by p."createdAt" DESC
            limit $1
        `, replacements); // $1 means it will be first replacement. vote status changes only if user is authorized

        /** queryBuilder analogue */
        // const queryBuilder = AppDataSource
        //     .getRepository(Post)
        //     .createQueryBuilder("pagination")
        //     .innerJoinAndSelect(
        //         "post.creator",
        //         "user", 'user.id = post."creatorId"',
        //     )
        //     .orderBy('post."createdAt"', "DESC") // specific for typeorm and postgresql - wrap single quotes around double quotes if you want to use camelCase, otherwise "createdAt" will look like 'createdat'
        //     .take(limitPaginationNumber)

        // if(cursor) {
        //     queryBuilder.where('post."createdAt" < :cursor', { 
        //         cursor: new Date(parseInt(cursor)),
        //     }); // query builder allows using if statements and continue querying
        // }

        // const posts = await queryBuilder.getMany();

        return { 
            posts: posts.slice(0, realLimit),
            hasMore: posts.length === limitPaginationNumber,
        };
    }

    @Query(() => Post, { nullable: true }) // query can be null
    post(@Arg('id', () => Int) id: number): Promise<Post | null > // specify id as int to make post.graphql id work (it was a float by default)
    {
        return Post.findOne({ 
            where: { id }, 
            relations: ["creator"] 
        });
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
        @Arg('title') title: string, // if you want to make this field nullable
        @Arg('text') text: string,
        @Ctx() { req }: MyContext
    ): Promise<Post | null> {
        const post = await Post.findOne({ where: {id} });
        if(!post) return null;
        else if(typeof title === 'undefined') return null;
        else if(typeof text === 'undefined') return null;
        else {
            // post.title = title;
            // await em.persistAndFlush(post); // save the data in db (MIKROORM equivalent)
            
            // const post = Post.update(
            //     { id, creatorId: req.session.userId }, 
            //     { title, text }
            // ) TYPEORM entity equivalent that is not working

            const queryResult = await AppDataSource
                .createQueryBuilder()
                .update(Post)
                .set({ title, text })
                .where('id = :id and "creatorId" = :creatorId', { 
                    id, creatorId: req.session.userId 
                })
                .returning("*") // return post after query exec
                .execute();
            return queryResult.raw[0] as Post;
        }   
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg('id', () => Int) id: number, // make that int
        @Ctx() { req }: MyContext, 
    ): Promise<boolean> {
        /** Without these codes you'll get a constaint error! */

        const currentUserId = req.session.userId;
        /** NOT CASCADE WAY OF DELETING */
        // const post = await Post.findOne({where: {id}});
        // if(!post) return false;
        // else if(post.creatorId !== currentUserId) {
        //     throw new Error('Not Authorized');
        // }
        // else {
        //     await Upvote.delete({ 
        //         postId: id
        //     });
        //     await Post.delete(id);
        // }

        /** CASCADE WAY OF DELETING (Upvote gets deleted automatically, to activate this go to Upvote model) */
        await Post.delete({
            id, 
            creatorId: currentUserId
        });
        return true;
    }
}