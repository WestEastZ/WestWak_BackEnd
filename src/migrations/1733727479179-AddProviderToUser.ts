import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProviderToUser1733727479179 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Provider enum 생성
    await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD COLUMN \`provider\` ENUM('local', 'kakao', 'google', 'github', 'naver')
            DEFAULT 'local'
            `);

    // provider 삽입
    await queryRunner.query(`
            UPDATE \`user\`
            SET \`provider\` = 'local'
            WHERE \`provider\` IS NULL
        `);

    // 복합 인덱스 생성

    //
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`user\`
            DROP COLUMN \`provider\`
        `);
  }
}
