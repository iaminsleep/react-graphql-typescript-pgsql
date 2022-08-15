import { MigrationInterface, QueryRunner } from "typeorm";

export class twitter1660586433501 implements MigrationInterface {
    // name = 'twitter1660586433501'

    public async up(_: QueryRunner): Promise<void> {
        // await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "login" character varying NOT NULL, "password" character varying NOT NULL, "username" character varying, "avatar" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_a62473490b3e4578fd683235c5e" UNIQUE ("login"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        // await queryRunner.query(`CREATE TABLE "post" ("id" SERIAL NOT NULL, "text" character varying NOT NULL, "likes_count" integer NOT NULL DEFAULT '0', "image" character varying, "creatorId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);
        // await queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "FK_e8fb739f08d47955a39850fac23" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        // await queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "FK_3acf7c55c319c4000e8056c1279" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        // await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_9e91e6a24261b66f53971d3f96b" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(_: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_9e91e6a24261b66f53971d3f96b"`);
        // await queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "FK_3acf7c55c319c4000e8056c1279"`);
        // await queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "FK_e8fb739f08d47955a39850fac23"`);
        // await queryRunner.query(`DROP TABLE "post"`);
        // await queryRunner.query(`DROP TABLE "user"`);
    }

}
