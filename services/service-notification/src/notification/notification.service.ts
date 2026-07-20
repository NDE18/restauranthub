import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'websocket';

export interface SendNotificationDto {
  userId: string;
  channel: NotificationChannel;
  template: string;
  data: Record<string, any>;
  to?: string; // email ou numéro
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly config: ConfigService) {
    const sendgridKey = config.get<string>('SENDGRID_API_KEY');
    if (sendgridKey) sgMail.setApiKey(sendgridKey);
  }

  async send(dto: SendNotificationDto): Promise<void> {
    switch (dto.channel) {
      case 'email':
        await this.sendEmail(dto);
        break;
      case 'sms':
        await this.sendSms(dto);
        break;
      case 'push':
        await this.sendPush(dto);
        break;
      default:
        this.logger.warn(`Canal inconnu : ${dto.channel}`);
    }
  }

  private async sendEmail(dto: SendNotificationDto): Promise<void> {
    if (!dto.to) return;

    try {
      const msg = {
        to: dto.to,
        from: this.config.get('EMAIL_FROM', 'noreply@restaurant.fr'),
        subject: this.getSubject(dto.template, dto.data),
        html: this.renderTemplate(dto.template, dto.data),
      };
      await sgMail.send(msg);
      this.logger.log(`Email envoyé à ${dto.to} (template: ${dto.template})`);
    } catch (err) {
      this.logger.error(`Erreur envoi email : ${err.message}`);
      throw err;
    }
  }

  private async sendSms(dto: SendNotificationDto): Promise<void> {
    // Intégration Twilio — à compléter avec twilio SDK
    this.logger.log(`SMS simulé pour ${dto.userId} : ${dto.template}`);
  }

  private async sendPush(dto: SendNotificationDto): Promise<void> {
    // Intégration Firebase Admin SDK — à compléter
    this.logger.log(`Push simulé pour ${dto.userId} : ${dto.template}`);
  }

  private getSubject(template: string, data: Record<string, any>): string {
    const subjects: Record<string, string> = {
      'welcome': 'Bienvenue sur notre plateforme !',
      'reservation.confirmed': `Réservation confirmée pour le ${data.date}`,
      'order.paid': `Commande #${data.orderId} confirmée`,
      'order.ready': 'Votre commande est prête !',
      'delivery.delivered': 'Votre commande a été livrée',
      'payment.succeeded': 'Confirmation de paiement',
      'loyalty.tier-upgraded': `Félicitations ! Vous êtes passé au niveau ${data.tier}`,
    };
    return subjects[template] || 'Notification';
  }

  private renderTemplate(template: string, data: Record<string, any>): string {
    // En production : utiliser Handlebars avec des templates dans MongoDB
    return `<p>Notification : ${template}</p><pre>${JSON.stringify(data, null, 2)}</pre>`;
  }
}
