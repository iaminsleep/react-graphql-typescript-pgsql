import { Field, InputType } from "type-graphql";

@InputType()
export class PostInput {
    @Field()
    text!: string;
}
