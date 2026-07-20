import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from './entities/delivery.entity';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { DeliveryGateway } from './delivery.gateway';
import { DeliveryEventPublisher } from './kafka/delivery-event.publisher';
import { OrderEventConsumer } from './kafka/order-event.consumer';

@Module({
  imports: [TypeOrmModule.forFeature([Delivery])],
  controllers: [DeliveryController],
  providers: [
    DeliveryService,
    DeliveryGateway,
    DeliveryEventPublisher,
    OrderEventConsumer,
  ],
})
export class DeliveryModule {}
