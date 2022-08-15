import { Field, InputType } from "type-graphql";

@InputType()
export class UsernamePasswordInput {
    // set the object class to use later in @Arg variables
    @Field()
    email: string;
    @Field()
    login: string;
    @Field(() => String) // if you want to overwrite the type that we explicitly set
    password: string;
}
