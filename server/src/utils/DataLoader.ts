import DataLoader from "dataloader";
import { Like } from "../entities/Like";
import { User } from "../entities/User";

// DataLoader helps solving the problem with multiple sql queries. For example, when we fetch creator from post with FieldResolver() it is a separate sql query, and in home page we can have 100+ queries each of them get a single user. It not only merges everything in the same query, but also caches it, which is pretty important.

// keys = [1, 78, 8, 3]
// expects to return [{id: 1, username: 'nick'}, {}, {}, {}] - an array with the length of keys array but with the data inside
export const createUserLoader = () => 
new DataLoader<number, User>(async userIds => {
    const users = await User.findByIds(userIds as number[]);

    const userIdToUser: Record<number, User> = {};

    users.forEach(user => {
        userIdToUser[user.id] = user;
    });

    const usersArray = userIds.map((userId) => 
        userIdToUser[userId]
    );

    return usersArray;
}); 

// keys = [{postId: 5, userId: 10}, {}, {}]
// return {postId: 5, userId: 10, value: 1} and upvote itself
export const createUpvoteLoader = () => 
new DataLoader<{postId: number, userId: number}, Like | null>(async (keys) => {
    const likes = await Like.findByIds(keys as any);

    const likeIdsToUser: Record<string, Like> = {};

    likes.forEach(like => {
        likeIdsToUser[`${like.userId}|${like.postId}`] = like;
    });

    const likesArray = keys.map((key) => 
        likeIdsToUser[`${key.userId}|${key.postId}`]
    );

    return likesArray;
});