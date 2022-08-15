import { Entity, BaseEntity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field } from "type-graphql";
import { User } from './User';
import { Post } from './Post';

// Many to Many relationship
// Between Users <-> Posts
// In a Many to Many relationship User -> join table <- posts
// user -> upvotes <- posts

@ObjectType() // Turn the object into GraphQL object
@Entity()
export class Like extends BaseEntity 
{
    @Field() // if @Field is set, you cannot make a query in GraphQL without specifying this field in the query object.
    @PrimaryGeneratedColumn()
    id!: number; // ! means not null

    @Field()
    @PrimaryColumn()
    userId: number; // allow many to one relationship

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.likes)
    user: User; // create constaint for creatorId

    @Field()
    @PrimaryColumn()
    postId: number; // allow many to one relationship

    @Field(() => Post)
    @ManyToOne(() => Post, (post) => post.likes, {
        onDelete: "CASCADE", // if post is deleted it'll delete every connected db table rows (upvote table for example)
    })
    post: Post; // create constaint for creatorId

}