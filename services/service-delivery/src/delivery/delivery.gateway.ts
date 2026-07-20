import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/ws/deliveries',
  cors: { origin: '*' },
})
export class DeliveryGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('trackDelivery')
  handleTrack(
    @MessageBody() data: { deliveryId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`delivery:${data.deliveryId}`);
    client.emit('tracking', { deliveryId: data.deliveryId, status: 'subscribed' });
  }

  broadcastDriverLocation(deliveryId: string, lat: number, lng: number) {
    this.server.to(`delivery:${deliveryId}`).emit('driverLocation', {
      deliveryId,
      lat,
      lng,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastStatusChange(deliveryId: string, status: string) {
    this.server.to(`delivery:${deliveryId}`).emit('statusChanged', {
      deliveryId,
      status,
      timestamp: new Date().toISOString(),
    });
  }
}
