import { Controller, Post, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService, SendNotificationDto } from './notification.service';

@ApiTags('Notifications')
@Controller('api/v1/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Envoi (admin)' })
  send(@Body() dto: SendNotificationDto) {
    return this.notificationService.send(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Historique de mes notifications' })
  myNotifications() {
    return []; // À implémenter avec MongoDB journal
  }

  @Patch('preferences')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gestion opt-in/opt-out' })
  updatePreferences(@Body() preferences: Record<string, boolean>) {
    return { updated: true, preferences };
  }
}
