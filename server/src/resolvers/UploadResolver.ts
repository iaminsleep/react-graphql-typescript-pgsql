import { FileUpload, GraphQLUpload } from 'graphql-upload';
import path from 'path';
import { finished } from 'stream/promises';
import { Arg, Field, Mutation, ObjectType, Resolver } from 'type-graphql';

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
    newFilename!: string;
}

@Resolver()
export class UploadResolver {
    @Mutation(() => FileResponse)
    async uploadFile(
        @Arg('file', () => GraphQLUpload) file: FileUpload,
    ): Promise<FileResponse> {
        const { createReadStream, filename } = file;

        const { ext } = path.parse(filename);
        const newFilename = generateRandomString(12) + ext;
        // Invoking the `createReadStream` will return a Readable Stream
        const stream = createReadStream();

        const pathName = path.join(__dirname, `../../../client/public/img/post/${newFilename}`);

        const out = require('fs').createWriteStream(pathName);
        stream.pipe(out);
        await finished(out);

        return { newFilename };
    }
}
