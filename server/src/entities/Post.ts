import { 
  Column, CreateDateColumn, 
  Entity, PrimaryGeneratedColumn, 
  UpdateDateColumn, BaseEntity, 
  ManyToOne, OneToMany } from 'typeorm';
import { ObjectType, Field, Int } from "type-graphql";
import { User } from './User';
import { Like } from './Like';

@ObjectType() // Turn the object into GraphQL object
@Entity()
export class Post extends BaseEntity 
{
  @Field() // if @Field is set, you cannot make a query in GraphQL without specifying this field in the query object.
  @PrimaryGeneratedColumn()
  id!: number; // ! means not null

  @Field()
  @Column()
  text!: string;

  @Field(() => Int)
  @Column({ default: 0 }) // every post starts at 0 upvotes
  likes_count!: number;

  @Field(() => String, { nullable: true })
  @Column({ type: "varchar", nullable: true })
  image: string | null;

  @Field(() => Int, { nullable: true }) // this is only a graphql schema value, there is no column in db
  voteStatus: number | null;

  @Field()
  @Column()
  creatorId: number; // allow many to one relationship

  @Field()
  @ManyToOne(() => User, (user) => user.posts, {
      onDelete: "CASCADE", // if user is deleted it'll delete every post that was created by him
  })
  creator: User; // create constaint for creatorId

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

}