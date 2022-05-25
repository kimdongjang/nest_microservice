import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 단순성을 위해 각 주문에는 1개의 제품만 저장할 수 있고 가격은 주문 당시의 제품 가격이 됨
 */
@Entity()
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  public price!: number;

  /*
   * Relation IDs
   */

  @Column({ type: 'integer' })
  public productId!: number;

  @Column({ type: 'integer' })
  public userId!: number;
}
