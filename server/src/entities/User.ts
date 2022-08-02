import { ObjectType, Field } from "type-graphql";
import { 
  Column, CreateDateColumn, 
  Entity, BaseEntity, PrimaryGeneratedColumn, 
  UpdateDateColumn, OneToMany } from 'typeorm';
import { Post } from "./Post";
import { Upvote } from "./Upvote";

@ObjectType() // Turn the object into GraphQL object
@Entity()
export class User extends BaseEntity
{
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Column() // deletion of @Field property makes impossible to select password (for the security issues)
  password!: string;

  @OneToMany(() => Post, (post) => post.creator)
  posts: Post[];

  @OneToMany(() => Upvote, (upvote) => upvote.user)
  upvotes: Upvote[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

}