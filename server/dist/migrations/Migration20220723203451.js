"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20220723203451 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20220723203451 extends migrations_1.Migration {
    async up() {
        this.addSql('create table "post" ("_id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" varchar(255) not null);');
    }
    async down() {
        this.addSql('drop table if exists "post" cascade;');
    }
}
exports.Migration20220723203451 = Migration20220723203451;
//# sourceMappingURL=Migration20220723203451.js.map