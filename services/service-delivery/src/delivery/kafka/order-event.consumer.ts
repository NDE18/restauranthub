import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';
import { DeliveryService } from '../delivery.service';

@Injectable()
export class OrderEventConsumer implements OnModuleInit, OnModuleDestroy {
  private consumer: Consumer;

  constructor(
    private readonly config: ConfigService,
    private readonly deliveryService: DeliveryService,
  ) {
    const kafka = new Kafka({
      clientId: 'service-delivery-consumer',
      brokers: [config.get('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')],
    });
    this.consumer = kafka.consumer({ groupId: 'service-delivery-group' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topics: ['order-events'], fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const event = JSON.parse(message.value?.toString() || '{}');

        if (event.eventType === 'order.paid' && event.type === 'DELIVERY') {
          await this.deliveryService.create({
            orderId: event.orderId,
            restaurantId: event.restaurantId,
            customerId: event.userId,
            deliveryAddress: event.deliveryAddress,
          });
        }
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
