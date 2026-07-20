import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';
import { MenuService } from '../menu.service';

@Injectable()
export class MenuKafkaConsumer implements OnModuleInit, OnModuleDestroy {
  private consumer: Consumer;

  constructor(
    private readonly config: ConfigService,
    private readonly menuService: MenuService,
  ) {
    const kafka = new Kafka({
      clientId: 'service-menu',
      brokers: [this.config.get<string>('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')],
    });
    this.consumer = kafka.consumer({ groupId: 'service-menu-group' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topics: ['restaurant-events'],
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        const event = JSON.parse(message.value?.toString() || '{}');
        await this.handleEvent(event);
      },
    });
  }

  private async handleEvent(event: any) {
    switch (event.eventType) {
      case 'restaurant.created':
        // Menu vide initialisé automatiquement — rien à faire, le menu est créé à la demande
        break;
      case 'restaurant.deleted':
        await this.menuService.deleteByRestaurant(event.restaurantId);
        break;
    }
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
