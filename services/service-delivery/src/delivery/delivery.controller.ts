import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import { DeliveryStatus } from './entities/delivery.entity';

@ApiTags('Deliveries')
@Controller('api/v1/deliveries')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Détail et statut d\'une livraison' })
  findOne(@Param('id') id: string) {
    return this.deliveryService.findById(id);
  }

  @Get(':id/tracking')
  @ApiOperation({ summary: 'Position du livreur' })
  async tracking(@Param('id') id: string) {
    const d = await this.deliveryService.findById(id);
    return { lat: d.driverLat, lng: d.driverLng, status: d.status };
  }

  @Patch(':id/accept')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Acceptation par un livreur' })
  accept(@Param('id') id: string, @Body('driverId') driverId: string) {
    return this.deliveryService.accept(id, driverId);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mise à jour du statut' })
  updateStatus(@Param('id') id: string, @Body('status') status: DeliveryStatus) {
    return this.deliveryService.updateStatus(id, status);
  }

  @Patch(':id/location')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mise à jour position livreur (GPS)' })
  updateLocation(
    @Param('id') id: string,
    @Body('lat') lat: number,
    @Body('lng') lng: number,
  ) {
    return this.deliveryService.updateDriverLocation(id, lat, lng);
  }

  @Post('quote')
  @ApiOperation({ summary: 'Estimation des frais et délai de livraison' })
  quote(
    @Body('fromLat') fromLat: number,
    @Body('fromLng') fromLng: number,
    @Body('toLat') toLat: number,
    @Body('toLng') toLng: number,
  ) {
    return this.deliveryService.getQuote(fromLat, fromLng, toLat, toLng);
  }
}
