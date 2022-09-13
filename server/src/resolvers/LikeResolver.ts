import { isAuth } from "../middleware/isAuth";
import { AppDataSource } from "../typeorm-data-source";
import { MyContext } from "../types";
import { Arg, Ctx, Int, Mutation, UseMiddleware } from "type-graphql";
import { Like } from "../entities/Like";

export class LikeResolver {
    @Mutation(() => Boolean) // return boolean if worked or not
    @UseMiddleware(isAuth)
    async like(
        @Arg('postId', () => Int) postId: number,
        @Ctx() { req }: MyContext
    ) {
        const { userId } = req.session;

        // find upvote by post id and user id
        const like = await Like.findOne(
            { where: { postId, userId }}
        );
        
        // the user was found and he has voted on the post before
        if(like) {
            // has never voted before
            await AppDataSource.transaction(async transactionManager => {
                // /** The role of transaction is when one query fails, the others fail as well */

                await transactionManager.query(`
                    delete from "like"
                    where "userId" = $1 and "postId" = $2;
                `, [userId, postId]); // use prepared statement, escape characters technique
                
                await transactionManager.query(`
                    update post 
                    set likes_count = likes_count - 1
                    where id = $1;
                `, [postId])
            }) // break up one big query into two separate transactions
        } else if(!like) {
            // double check if the user has upvoted or downvoted so they are changing from upvote to downvote
            await AppDataSource.transaction(async transactionManager => {
                // /** The role of transaction is when one query fails, the others fail as well */

                await transactionManager.query(`
                    insert into "like" ("userId", "postId")
                    values ($1, $2);
                `, [userId, postId]);

                await transactionManager.query(`
                    update post 
                    set likes_count = likes_count + 1
                    where id = $1;
                `, [postId])
            });
        }

        return true;
    }
}