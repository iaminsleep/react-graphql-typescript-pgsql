import { ObjectType, Field } from "type-graphql";
import { Column, CreateDateColumn, Entity, BaseEntity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

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

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

}