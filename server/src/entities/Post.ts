import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity } from 'typeorm';
import { ObjectType, Field } from "type-graphql";

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

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

}