import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/ws/menus',
  cors: { origin: '*' },
})
export class MenuGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: { restaurantId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`restaurant:${data.restaurantId}`);
    client.emit('subscribed', { restaurantId: data.restaurantId });
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @MessageBody() data: { restaurantId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`restaurant:${data.restaurantId}`);
  }

  broadcastAvailabilityChange(
    restaurantId: string,
    itemId: string,
    available: boolean,
  ) {
    this.server.to(`restaurant:${restaurantId}`).emit('availabilityChanged', {
      itemId,
      available,
      timestamp: new Date().toISOString(),
    });
  }
}
