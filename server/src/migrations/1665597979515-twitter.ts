import { MigrationInterface, QueryRunner } from "typeorm";
import argon2 from "argon2";

export class twitter1665597979515 implements MigrationInterface {
    name = 'twitter1665597979515'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create tables
        await queryRunner.query(`CREATE TABLE "like" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "postId" integer NOT NULL, CONSTRAINT "PK_eff3e46d24d416b52a7e0ae4159" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "login" character varying NOT NULL, "password" character varying NOT NULL, "username" text, "avatar" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_a62473490b3e4578fd683235c5e" UNIQUE ("login"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post" ("id" SERIAL NOT NULL, "text" character varying NOT NULL, "likes_count" integer NOT NULL DEFAULT '0', "image" character varying, "creatorId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);

        /** Insert basic user data into database*/
        await queryRunner.query(`
            insert into "user" (email, login, password, username, avatar) 
            values ('brock@gmail.com', 'brock', '${await argon2.hash('brock1')}', 'brock', 'brock.jpg')
        `);
        await queryRunner.query(`
            insert into "user" (email, login, password, username, avatar) 
            values ('gogol@gmail.com', 'gogol', '${await argon2.hash('gogol2')}', 'gogol', 'gogol.jpg')
        `);
        await queryRunner.query(`
            insert into "user" (email, login, password, username, avatar) 
            values ('mary@gmail.com', 'mary', '${await argon2.hash('mary3')}', 'mary', 'mary.jpg')
        `);
        await queryRunner.query(`
            insert into "user" (email, login, password, username, avatar) 
            values ('raamin@gmail.com', 'raamin', '${await argon2.hash('raamin4')}', 'raamin', 'raamin.jpg')
        `);
        await queryRunner.query(`
            insert into "user" (email, login, password, username, avatar) 
            values ('vasil@gmail.com', 'vasil', '${await argon2.hash('vasil5')}', 'vasil', 'vasil.jpg')
        `);
        await queryRunner.query(`
            insert into "user" (email, login, password, username, avatar) 
            values ('winston@gmail.com', 'winston', '${await argon2.hash('winston6')}', 'winston', 'winston.jpg')
        `);
        
        /** Insert basic post data into database*/
        await queryRunner.query(`
            insert into post (text, likes_count, image, "creatorId") 
            values ('What a wonderful night!', 316, 'wonderful_night.jpg', 1)
        `);
        await queryRunner.query(`
            insert into post (text, likes_count, image, "creatorId") 
            values ('These are my most prized possessions. I won''t tell what they are, but they fill a room.', 204, 'prize_collection.jpg', 2)
        `);
        await queryRunner.query(`
            insert into post (text, likes_count, image, "creatorId") 
            values ('How many times can I say tired in this tweet? Trick question, the answer is as many times as I want because I''m tired.', 216, null, 3)
        `);
        await queryRunner.query(`
            insert into post (text, likes_count, image, "creatorId") 
            values ('I''m gonna build a really, really big wooden bridge. And it''s gonna be great.', 1124, 'wooden_bridge.jpg', 4)
        `);
        await queryRunner.query(`
            insert into post (text, likes_count, image, "creatorId") 
            values ('it''s time to make some changes to your life and say goodbye to the things that hold you back from being the best version of yourself', 2559, null, 5)
        `);
        await queryRunner.query(`
            insert into post (text, likes_count, image, "creatorId") 
            values ('When the mountain takes a break, it''s time to take a break too.', 437, 'mountain_climb.jpg', 6)
        `);

        // Add constraint keys
        await queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "FK_e8fb739f08d47955a39850fac23" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "FK_3acf7c55c319c4000e8056c1279" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_9e91e6a24261b66f53971d3f96b" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_9e91e6a24261b66f53971d3f96b"`);
        await queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "FK_3acf7c55c319c4000e8056c1279"`);
        await queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "FK_e8fb739f08d47955a39850fac23"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "like"`);
    }

}
