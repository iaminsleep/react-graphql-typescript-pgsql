import { ObjectType, Field } from "type-graphql";
import { 
  Column, CreateDateColumn, 
  Entity, BaseEntity, PrimaryGeneratedColumn, 
  UpdateDateColumn, OneToMany } from 'typeorm';
import { Post } from "./Post";
import { Like } from "./Like";

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
  login!: string;

  @Column() // deletion of @Field property makes impossible to select password (for the security matter)
  password!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  username: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatar: string;

  @OneToMany(() => Post, (post) => post.creator)
  posts: Post[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

}