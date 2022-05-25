import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { CreateOrderRequestDto } from './order.dto';
import { Order } from './order.entity';
import { CreateOrderResponse } from './proto/order.pb';
import { DecreaseStockResponse, FindOneResponse, ProductServiceClient, PRODUCT_SERVICE_NAME } from './proto/product.pb';

/**
 * 주문 서비스는 다른 마이크로 서비스에서 마이크로 서비스를 호출하도록 함
 * Product Microservice를 두번 호출하며, 먼저 상품이 존재하는지 확인한 다음,
 * 이 상품의 재고를 줄여 Order를 생성함
 */
@Injectable()
export class OrderService implements OnModuleInit {
  private productSvc: ProductServiceClient;

  @Inject(PRODUCT_SERVICE_NAME)
  private readonly client: ClientGrpc;

  @InjectRepository(Order)
  private readonly repository: Repository<Order>;

  /**
   * 제품 서비스를 사용하기 위한 초기화 진행
   */
  public onModuleInit(): void {
    this.productSvc = this.client.getService<ProductServiceClient>(PRODUCT_SERVICE_NAME);
  }

  public async createOrder(data: CreateOrderRequestDto): Promise<CreateOrderResponse> {
    // Observable 타입의 값을 구독하고, 첫번재 값이 도착하자마자 Promise에 값을 리턴함
    const product: FindOneResponse = await firstValueFrom(this.productSvc.findOne({ id: data.productId }));

    if (product.status >= HttpStatus.NOT_FOUND) {
      return { id: null, error: ['Product not found'], status: product.status };
    } else if (product.data.stock < data.quantity) {
      return { id: null, error: ['Stock too less'], status: HttpStatus.CONFLICT };
    }

    const order: Order = new Order();

    order.price = product.data.price;
    order.productId = product.data.id;
    order.userId = data.userId;

    await this.repository.save(order);

    const decreasedStockData: DecreaseStockResponse = await firstValueFrom(this.productSvc.decreaseStock({ id: data.productId, orderId: order.id }));

    if (decreasedStockData.status === HttpStatus.CONFLICT) {
      // deleting order if decreaseStock fails
      await this.repository.delete({ id: order.id });

      return { id: null, error: decreasedStockData.error, status: HttpStatus.CONFLICT };
    }

    return { id: order.id, error: null, status: HttpStatus.OK };
  }
}
