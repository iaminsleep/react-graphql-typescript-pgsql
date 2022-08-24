import { FileUpload, GraphQLUpload } from 'graphql-upload';
import path from 'path';
import { finished } from 'stream/promises';
import { Arg, Field, InputType, Mutation, ObjectType, Resolver } from 'type-graphql';

function generateRandomString(length: number) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

@ObjectType() // GraphQL object
class FileResponse {
    @Field()
    filename!: string;

    @Field()
    mimetype!: string;

    @Field()
    encoding!: string;
}

@InputType()
class FileInput {
    @Field(() => GraphQLUpload)
    file: FileUpload
}

@Resolver()
export class UploadResolver {
    @Mutation(() => FileResponse)
    async uploadFile(
        @Arg('file', () => FileInput) { file }: FileInput,
    ): Promise<FileResponse> {
        const { createReadStream, filename, mimetype, encoding } = file;

        const { ext } = path.parse(filename);
        const randomName = generateRandomString(12) + ext;
        // Invoking the `createReadStream` will return a Readable Stream
        const stream = createReadStream();

        const pathName = path.join(__dirname, `./public/img/post/${randomName}`);

        const out = require('fs').createWriteStream(pathName);
        stream.pipe(out);
        await finished(out);

        return { filename, mimetype, encoding };
    }
}
