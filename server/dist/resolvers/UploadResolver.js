"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadResolver = void 0;
const graphql_upload_1 = require("graphql-upload");
const path_1 = __importDefault(require("path"));
const promises_1 = require("stream/promises");
const type_graphql_1 = require("type-graphql");
function generateRandomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
let FileResponse = class FileResponse {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FileResponse.prototype, "filename", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FileResponse.prototype, "mimetype", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FileResponse.prototype, "encoding", void 0);
FileResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], FileResponse);
let UploadResolver = class UploadResolver {
    async uploadFile(file) {
        const { createReadStream, filename, mimetype, encoding } = file;
        const { ext } = path_1.default.parse(filename);
        const randomName = generateRandomString(12) + ext;
        const stream = createReadStream();
        const pathName = path_1.default.join(__dirname, `./public/img/post/${randomName}`);
        const out = require('fs').createWriteStream(pathName);
        stream.pipe(out);
        await (0, promises_1.finished)(out);
        return { filename, mimetype, encoding };
    }
};
__decorate([
    (0, type_graphql_1.Mutation)(() => FileResponse),
    __param(0, (0, type_graphql_1.Arg)('file', () => graphql_upload_1.GraphQLUpload)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadResolver.prototype, "uploadFile", null);
UploadResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], UploadResolver);
exports.UploadResolver = UploadResolver;
//# sourceMappingURL=UploadResolver.js.map