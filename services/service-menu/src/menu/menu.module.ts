import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuItem, MenuItemSchema } from './schemas/menu-item.schema';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { MenuGateway } from './menu.gateway';
import { MenuKafkaConsumer } from './kafka/menu-kafka.consumer';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MenuItem.name, schema: MenuItemSchema },
    ]),
  ],
  controllers: [MenuController],
  providers: [MenuService, MenuGateway, MenuKafkaConsumer],
})
export class MenuModule {}
