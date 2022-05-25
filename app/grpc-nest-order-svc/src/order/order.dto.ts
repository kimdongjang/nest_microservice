import { IsNumber, Min } from 'class-validator';
import { CreateOrderRequest } from './proto/order.pb';

/**
 * 유효성 검사를 위한 DTO. 수량은 최소 1
 */
export class CreateOrderRequestDto implements CreateOrderRequest {
  @IsNumber()
  public productId: number;

  @IsNumber()
  @Min(1)
  public quantity: number;

  @IsNumber()
  public userId: number;
}
