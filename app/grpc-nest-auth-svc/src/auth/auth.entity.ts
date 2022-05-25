import { Exclude } from 'class-transformer';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Auth extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ type: 'varchar' })
  public email!: string;

  /**
   * Exclude() : JSON 직렬화 대상에서 제외함. private 변수라도 직렬화를 시킬 수가 있어 보안적인 측면에선 제외해야 함.
   */
  @Exclude()
  @Column({ type: 'varchar' })
  public password!: string;
}
