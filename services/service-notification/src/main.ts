import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('service-notification')
    .setDescription('Emails, SMS, push et WebSocket')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup('swagger-ui', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
