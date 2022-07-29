import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity, ManyToOne } from 'typeorm';
import { ObjectType, Field } from "type-graphql";
import { User } from './User';

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
  upvotes!: number;

  @Field()
  @Column()
  creatorId: number; // allow many to one relationship

  @ManyToOne(() => User, (user) => user.posts)
  creator: User; // create constaint for creatorId

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

}