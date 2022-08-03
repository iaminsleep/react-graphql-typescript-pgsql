import { 
  Column, CreateDateColumn, 
  Entity, PrimaryGeneratedColumn, 
  UpdateDateColumn, BaseEntity, 
  ManyToOne, OneToMany } from 'typeorm';
import { ObjectType, Field, Int } from "type-graphql";
import { User } from './User';
import { Upvote } from './Upvote';

@ObjectType() // Turn the object into GraphQL object
@Entity()
export class Post extends BaseEntity 
{
  @Field() // if @Field is set, you cannot make a query in GraphQL without specifying this field in the query object.
  @PrimaryGeneratedColumn()
  id!: number; // ! means not null

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: "int", default: 0 }) // every post starts at 0 upvotes
  points!: number;

  @Field(() => Int, { nullable: true }) // this is only a graphql schema value, there is no column in db
  voteStatus: number | null;

  @Field()
  @Column()
  creatorId: number; // allow many to one relationship

  @Field()
  @ManyToOne(() => User, (user) => user.posts)
  creator: User; // create constaint for creatorId

  @OneToMany(() => Upvote, (upvote) => upvote.post)
  upvotes: Upvote[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

}