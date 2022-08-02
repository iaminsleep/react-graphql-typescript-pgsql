import { isAuth } from "../middleware/isAuth";
import { AppDataSource } from "../typeorm-data-source";
import { MyContext } from "../types";
import { Arg, Ctx, Int, Mutation, UseMiddleware } from "type-graphql";

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

        /** The role of transaction is when one query fails, the others fail as well */
        AppDataSource.query(`
            START TRANSACTION;

            insert into upvote ("userId", "postId", value)
            values ${userId}, ${postId}, ${realValue});

            update post 
            set points = points + ${realValue}
            where id = ${postId};

            COMMIT;
        `);

        return true;
    }
}