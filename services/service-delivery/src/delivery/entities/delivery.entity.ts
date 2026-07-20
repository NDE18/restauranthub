import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DeliveryStatus {
  CREATED = 'CREATED',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', unique: true })
  orderId: string;

  @Column({ name: 'restaurant_id' })
  restaurantId: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ name: 'delivery_address', type: 'text' })
  deliveryAddress: string;

  @Column({ name: 'delivery_lat', type: 'double precision', nullable: true })
  deliveryLat: number;

  @Column({ name: 'delivery_lng', type: 'double precision', nullable: true })
  deliveryLng: number;

  @Column({ name: 'driver_id', nullable: true })
  driverId: string;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.CREATED,
  })
  status: DeliveryStatus;

  @Column({ name: 'estimated_minutes', nullable: true })
  estimatedMinutes: number;

  @Column({ name: 'delivery_fee', type: 'numeric', precision: 10, scale: 2, nullable: true })
  deliveryFee: number;

  @Column({ name: 'driver_lat', type: 'double precision', nullable: true })
  driverLat: number;

  @Column({ name: 'driver_lng', type: 'double precision', nullable: true })
  driverLng: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
