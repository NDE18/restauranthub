import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';
import { NotificationService } from '../notification.service';

/**
 * Consomme tous les topics métier et déclenche les notifications appropriées.
 */
@Injectable()
export class NotificationConsumer implements OnModuleInit, OnModuleDestroy {
  private consumer: Consumer;
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(
    private readonly config: ConfigService,
    private readonly notificationService: NotificationService,
  ) {
    const kafka = new Kafka({
      clientId: 'service-notification',
      brokers: [config.get('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')],
    });
    this.consumer = kafka.consumer({ groupId: 'service-notification-group' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topics: [
        'user-events',
        'reservation-events',
        'order-events',
        'payment-events',
        'delivery-events',
        'loyalty-events',
      ],
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const event = JSON.parse(message.value?.toString() || '{}');
          await this.dispatch(event);
        } catch (err) {
          this.logger.error(`Erreur traitement message : ${err.message}`);
        }
      },
    });
  }

  private async dispatch(event: Record<string, any>) {
    const { eventType } = event;

    const handlers: Record<string, () => Promise<void>> = {
      'user.created': () => this.notificationService.send({
        userId: event.userId,
        channel: 'email',
        template: 'welcome',
        to: event.email,
        data: { firstName: event.firstName },
      }),
      'reservation.confirmed': () => this.notificationService.send({
        userId: event.userId,
        channel: 'email',
        template: 'reservation.confirmed',
        data: { date: event.date, time: event.time, guests: event.guests },
      }),
      'order.paid': () => this.notificationService.send({
        userId: event.userId,
        channel: 'email',
        template: 'order.paid',
        data: { orderId: event.orderId },
      }),
      'order.ready': () => this.notificationService.send({
        userId: event.userId,
        channel: 'push',
        template: 'order.ready',
        data: { orderId: event.orderId },
      }),
      'delivery.delivered': () => this.notificationService.send({
        userId: event.customerId,
        channel: 'push',
        template: 'delivery.delivered',
        data: { deliveryId: event.deliveryId },
      }),
      'payment.succeeded': () => this.notificationService.send({
        userId: event.userId,
        channel: 'email',
        template: 'payment.succeeded',
        data: { amount: event.amount },
      }),
      'loyalty.tier-upgraded': () => this.notificationService.send({
        userId: event.userId,
        channel: 'email',
        template: 'loyalty.tier-upgraded',
        data: { tier: event.tier },
      }),
    };

    const handler = handlers[eventType];
    if (handler) {
      await handler();
    } else {
      this.logger.debug(`Événement ignoré : ${eventType}`);
    }
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
