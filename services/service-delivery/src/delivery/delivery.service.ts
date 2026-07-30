import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery, DeliveryStatus } from './entities/delivery.entity';
import { DeliveryGateway } from './delivery.gateway';
import { DeliveryEventPublisher } from './kafka/delivery-event.publisher';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(Delivery) private deliveryRepo: Repository<Delivery>,
    private readonly gateway: DeliveryGateway,
    private readonly publisher: DeliveryEventPublisher,
  ) {}

  async create(data: {
    orderId: string;
    restaurantId: string;
    customerId: string;
    deliveryAddress: string;
  }): Promise<Delivery> {
    const delivery = this.deliveryRepo.create({
      ...data,
      status: DeliveryStatus.CREATED,
    });
    const saved = await this.deliveryRepo.save(delivery);
    await this.publisher.publishCreated(saved);
    return saved;
  }

  async findById(id: string): Promise<Delivery> {
    const d = await this.deliveryRepo.findOne({ where: { id } });
    if (!d) throw new NotFoundException(`Livraison introuvable - : ${id}`);
    return d;
  }

  async accept(id: string, driverId: string): Promise<Delivery> {
    const d = await this.findById(id);
    d.driverId = driverId;
    d.status = DeliveryStatus.ASSIGNED;
    const saved = await this.deliveryRepo.save(d);
    this.gateway.broadcastStatusChange(id, DeliveryStatus.ASSIGNED);
    await this.publisher.publishAssigned(saved);
    return saved;
  }

  async updateStatus(id: string, status: DeliveryStatus): Promise<Delivery> {
    const d = await this.findById(id);
    d.status = status;
    const saved = await this.deliveryRepo.save(d);
    this.gateway.broadcastStatusChange(id, status);

    if (status === DeliveryStatus.DELIVERED) {
      await this.publisher.publishDelivered(saved);
    }

    return saved;
  }

  async updateDriverLocation(id: string, lat: number, lng: number): Promise<void> {
    await this.deliveryRepo.update(id, { driverLat: lat, driverLng: lng });
    this.gateway.broadcastDriverLocation(id, lat, lng);
  }

  async getQuote(fromLat: number, fromLng: number, toLat: number, toLng: number) {
    // Calcul simplifié de la distance à vol d'oiseau (Haversine)
    const R = 6371;
    const dLat = this.toRad(toLat - fromLat);
    const dLng = this.toRad(toLng - fromLng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(fromLat)) * Math.cos(this.toRad(toLat)) * Math.sin(dLng / 2) ** 2;
    const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const fee = Math.max(2.5, distKm * 0.8);
    const estimatedMinutes = Math.round(distKm * 3);

    return { distanceKm: Math.round(distKm * 10) / 10, fee, estimatedMinutes };
  }

  private toRad(deg: number) {
    return (deg * Math.PI) / 180;
  }
}
