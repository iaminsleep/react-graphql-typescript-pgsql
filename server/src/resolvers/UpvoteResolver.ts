import { isAuth } from "../middleware/isAuth";
import { AppDataSource } from "../typeorm-data-source";
import { MyContext } from "../types";
import { Arg, Ctx, Int, Mutation, UseMiddleware } from "type-graphql";
import { Upvote } from "../entities/Upvote";

export class UpvoteResolver {
    @Mutation(() => Boolean) // return boolean if worked or not
    @UseMiddleware(isAuth)
    async vote(
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() { req }: MyContext
    ) {
        const isUpvote = value !== -1;
        const realValue = isUpvote ? 1 : -1;
        const { userId } = req.session;

        // find upvote by post id and user id
        const upvote = await Upvote.findOne(
            { where: { postId, userId }}
        );
        
        // the user was found and he has voted on the post before
        if(upvote && upvote.value !== realValue) { 
            // double check if the user has upvoted or downvoted so they are changing from upvote to downvote
            await AppDataSource.transaction(async transactionManager => {
                // /** The role of transaction is when one query fails, the others fail as well */

                await transactionManager.query(`
                    update upvote
                    set value = $1
                    where "postId" = $2 and "userId" = $3;
                `, [realValue, postId, userId]);

                await transactionManager.query(`
                    update post 
                    set points = points + $1
                    where id = $2;
                `, [realValue, postId])
            });
        } else if(!upvote) {
            // has never voted before
            await AppDataSource.transaction(async transactionManager => {
                // /** The role of transaction is when one query fails, the others fail as well */

                await transactionManager.query(`
                    insert into upvote ("userId", "postId", value)
                    values ($1, $2, $3);
                `, [userId, postId, realValue]); // use prepared statement, escape characters technique
                
                await transactionManager.query(`
                    update post 
                    set points = points + $1
                    where id = $2;
                `, [realValue, postId])
            }) // break up one big query into two separate transactions
        }

        // AppDataSource.query(`
        //     START TRANSACTION;

                // the query above is equal to this!

        //     COMMIT;
        // `);

        return true;
    }
}