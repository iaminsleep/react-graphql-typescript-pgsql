import { Post } from "../entities/Post";
import { Arg, Ctx, Field, FieldResolver, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { AppDataSource } from "../typeorm-data-source";
import { User } from "../entities/User";
import { FileUpload, GraphQLUpload } from "graphql-upload";
import path from 'path';
import { finished } from 'stream/promises';
import fs from 'fs';

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post]) // specify what does the field return
    posts: Post[] // return an array of posts
    @Field()
    hasMore: boolean; // helps define if there are any posts left
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

// speicfy what we are resolving 
@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet(@Root() post: Post) {
        return post.text.slice(0, 200);
    }
    @FieldResolver(() => String)
    postCreationDateString(@Root() post: Post) {
        return Intl.DateTimeFormat(undefined, {
            year: "numeric",
            day: "numeric",
            month: "long",
            hour: "numeric",
            minute: "numeric",
        }).format(post.createdAt);
    }

    @FieldResolver(() => User)
    creator(
        @Root() post: Post,
        @Ctx() {userLoader}: MyContext
    ) {
        // Without DataLoader
        // return User.findOne({ where: {id: post.creatorId}});

        //With DataLoader
        return userLoader.load(post.creatorId); // What DataLoader does is this batches all the post ids into a single query using an array of numbers
    }

    @FieldResolver(() => Int, { nullable: true })
    async voteStatus(
        @Root() post: Post,
        @Ctx() { likeLoader, req }: MyContext
    ) {
        if(!req.session.userId) return null;

        const like = await likeLoader.load({ 
            postId: post.id, 
            userId: req.session.userId 
        })

        if(like) return 1;
        else return 0; // return voteStatus - if the authenitcated user voted on the post
    }

    /** CRUD Operations Through GraphQL */
    @Query(() => PaginatedPosts)
    async posts(
        @Arg('limit', () => Int) limit: number, // limit of posts
        @Arg('cursor', () => String, { nullable: true}) cursor: string | null,
        @Arg('searchBy', () => String, { nullable: true}) searchBy: string | null,
        @Arg('userId', () => Int, { nullable: true}) userId: number | null,
        @Ctx() { req }: MyContext
    ): Promise<PaginatedPosts> {
        // await sleep(3000); // keep for fun, impacts delete post speed
        // return Post.find(); // returns Promise of ALL posts - completion of asynchronous operation.

        // 100 -> 101 make the query take 1 more post than usual to check if there are posts left
        const realLimit = Math.min(50, limit); // if some users wanted to change the query, this line of code won't allow this
        const limitPaginationNumber = realLimit + 1;

        const replacements: any[] = [limitPaginationNumber];

        if(cursor) {
            replacements.push(new Date(parseInt(cursor)));
        }

        const posts = await AppDataSource.query(`
            SELECT p.*
            FROM post p
            ${searchBy === "LIKED" && req.session.userId
                ? `JOIN "like" lk ON lk."postId" = p.id WHERE lk."userId" = ${req.session.userId}`
                : ''
            }
            ${searchBy === "LIKED" && req.session.userId && cursor 
                ? ' AND p."createdAt" < $2' 
                : ''
            }
            ${searchBy !== "LIKED" && cursor
                ? 'WHERE p."createdAt" < $2'
                : ''
            }
            ${(searchBy === "LIKED" || cursor && req.session.userId) && userId
                ? ` AND p."creatorId" = ${userId}` 
                : ''
            }
            ${(searchBy !== "LIKED" && !cursor) && userId
                ? `WHERE p."creatorId" = ${userId}`
                : ''
            }
            ${searchBy === "LIKES_COUNT" ? 'ORDER BY p.likes_count DESC' : 'ORDER BY p."createdAt" DESC'}
            limit $1
        `, replacements); // $1 means it will be first replacement. vote status changes only if user is authorized

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
            // relations: ["creator"] in case you use json_buildobject and INNER JOIN in posts() query above
        });
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth) // check if user is authenticated by checking the cookie in the database
    async createPost(
        @Arg('text') text: string,
        @Arg('file', () => GraphQLUpload, { nullable: true }) file: FileUpload,
        @Ctx() { req }: MyContext
    ): Promise<Post> {
        const queryRunner = AppDataSource.createQueryRunner();
        var result = await queryRunner.manager.query(
            `SELECT max(id) FROM post`
        );
        const lastId = result[0].max;

        let newFilename = null;
        
        if(file) {
            const { createReadStream, filename } = file;

            const { ext } = path.parse(filename);
            newFilename = generateRandomString(12) + ext;
            const stream = createReadStream();

            const pathName = path.join(__dirname, `../../../client/public/img/post/${newFilename}`);

            const out = fs.createWriteStream(pathName);
            stream.pipe(out);
            await finished(out);
        }

        return Post.create({
            id: lastId + 1,
            text, // paste user input
            image: newFilename ?? null,
            creatorId: req.session.userId // take userid from express-session (not redis database!)
        }).save(); // save() function from typeorm equivalent to MikroORM's 'persistAndFlush()'
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('text') text: string,
        @Arg('file', () => GraphQLUpload, { nullable: true }) file: FileUpload,
        @Ctx() { req }: MyContext
    ): Promise<Post | null> {
        const post = await Post.findOne({ where: {id} });
        if(!post) return null;

        else if(typeof text === 'undefined') return null;

        else {
            let newFilename = null;
            
            if(typeof file !== 'undefined' && file !== null) {
                const { createReadStream, filename } = file;

                const { ext } = path.parse(filename);
                newFilename = generateRandomString(12) + ext;
                const stream = createReadStream();

                const pathName = path.join(__dirname, `../../../client/public/img/post/${newFilename}`);

                const out = require('fs').createWriteStream(pathName);
                stream.pipe(out);
                await finished(out);

                if(post.image) {
                    const pathName = path.join(__dirname, `../../../client/public/img/post/${post.image}`);
                    fs.unlinkSync(pathName);
                }
            } else if (file === null && typeof file !== 'undefined' && post.image) {
                const pathName = path.join(__dirname, `../../../client/public/img/post/${post.image}`);
                fs.unlinkSync(pathName);
            }

            const queryResult = await AppDataSource
                .createQueryBuilder()
                .update(Post)
                .set({ text, image: ( 
                        file === null ? null :
                        newFilename !== null ? newFilename : 
                        file === undefined && newFilename === null ? post.image : null
                    )})
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
        const currentUserId = req.session.userId;

        const post = await Post.findOne({ where: {id} });

        if(!post) return false;

        if(post.image) {
            const pathName = path.join(__dirname, `../../../client/public/img/post/${post.image}`);
            fs.unlinkSync(pathName);
        }
        
        /** Without these codes you'll get a constraint error! */

        /** NON CASCADE WAY OF DELETING */

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

        /** CASCADE WAY OF DELETING (likes get deleted automatically, to activate this go to Like model) */
        await Post.delete({
            id, 
            creatorId: currentUserId
        });
        
        return true;
    }
}