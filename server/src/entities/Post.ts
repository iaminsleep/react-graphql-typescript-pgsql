import { Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectType, Field, Int } from "type-graphql";

@ObjectType() // Turn the object into GraphQL object
@Entity()
export class Post 
{
  [OptionalProps]?: 'updatedAt' | 'createdAt';

  @Field(() => Int) // if @Field is set, you cannot make a query in GraphQL without specifying this field in the query object.
  @PrimaryKey()
  id!: number; // ! means not null

  @Field(() => String)
  @Property({ type: 'text' })
  title!: string;

  @Field(() => String)
  @Property({type: 'date'})
  createdAt: Date = new Date();

  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

}