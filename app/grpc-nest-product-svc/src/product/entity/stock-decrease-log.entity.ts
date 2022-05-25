import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';

/**
 * 주문 ID 및 제품 ID에 바인딩된 작업들을 저장. 예측할 수 없는 버그를 감지하기 위해.
 */
@Entity()
export class StockDecreaseLog extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  /*
   * Relation IDs
   */

  @Column({ type: 'integer' })
  public orderId!: number;

  /*
   * Many-To-One Relationships
   */

  @ManyToOne(() => Product, (product) => product.stockDecreaseLogs)
  public product: Product;
}
