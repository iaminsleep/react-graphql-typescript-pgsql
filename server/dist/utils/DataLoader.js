"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUpvoteLoader = exports.createUserLoader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const Like_1 = require("../entities/Like");
const User_1 = require("../entities/User");
const createUserLoader = () => new dataloader_1.default(async (userIds) => {
    const users = await User_1.User.findByIds(userIds);
    const userIdToUser = {};
    users.forEach(user => {
        userIdToUser[user.id] = user;
    });
    const usersArray = userIds.map((userId) => userIdToUser[userId]);
    return usersArray;
});
exports.createUserLoader = createUserLoader;
const createUpvoteLoader = () => new dataloader_1.default(async (keys) => {
    const likes = await Like_1.Like.findByIds(keys);
    const likeIdsToUser = {};
    likes.forEach(like => {
        likeIdsToUser[`${like.userId}|${like.postId}`] = like;
    });
    const likesArray = keys.map((key) => likeIdsToUser[`${key.userId}|${key.postId}`]);
    return likesArray;
});
exports.createUpvoteLoader = createUpvoteLoader;
//# sourceMappingURL=DataLoader.js.map