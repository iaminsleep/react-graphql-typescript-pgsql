"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUpvoteLoader = exports.createUserLoader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const Upvote_1 = require("../entities/Upvote");
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
    const upvotes = await Upvote_1.Upvote.findByIds(keys);
    const upvoteIdsToUser = {};
    upvotes.forEach(upvote => {
        upvoteIdsToUser[`${upvote.userId}|${upvote.postId}`] = upvote;
    });
    const upvotesArray = keys.map((key) => upvoteIdsToUser[`${key.userId}|${key.postId}`]);
    return upvotesArray;
});
exports.createUpvoteLoader = createUpvoteLoader;
//# sourceMappingURL=DataLoader.js.map