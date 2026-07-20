import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';
import { Delivery } from '../entities/delivery.entity';

@Injectable()
export class DeliveryEventPublisher implements OnModuleInit, OnModuleDestroy {
  private producer: Producer;
  private topic: string;

  constructor(private readonly config: ConfigService) {
    const kafka = new Kafka({
      clientId: 'service-delivery',
      brokers: [config.get('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')],
    });
    this.producer = kafka.producer({ idempotent: true });
    this.topic = config.get('KAFKA_TOPIC_DELIVERY_EVENTS', 'delivery-events');
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async publishCreated(d: Delivery) {
    await this.send({ eventType: 'delivery.created', deliveryId: d.id, orderId: d.orderId });
  }

  async publishAssigned(d: Delivery) {
    await this.send({ eventType: 'delivery.assigned', deliveryId: d.id, orderId: d.orderId, driverId: d.driverId });
  }

  async publishDelivered(d: Delivery) {
    await this.send({ eventType: 'delivery.delivered', deliveryId: d.id, orderId: d.orderId, customerId: d.customerId });
  }

  private async send(payload: Record<string, any>) {
    await this.producer.send({
      topic: this.topic,
      messages: [{ key: payload.deliveryId, value: JSON.stringify({ ...payload, timestamp: new Date().toISOString() }) }],
    });
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }
}
