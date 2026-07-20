import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Code Journey API')
    .setDescription(
      'Code Journey mobil uygulamasının backend API dokümantasyonu',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag(
      'Health',
      'Backend ve veritabanı sağlık kontrolü',
    )
    .addTag(
      'Users',
      'Kullanıcı işlemleri',
    )
    .addTag(
      'Auth',
      'Kayıt ve giriş işlemleri',
    )
    .build();

  const swaggerDocument =
    SwaggerModule.createDocument(
      app,
      swaggerConfig,
    );

  SwaggerModule.setup(
    'api/docs',
    app,
    swaggerDocument,
  );

  const port = process.env.PORT ?? 3001;

  await app.listen(port);

  console.log(
    `Code Journey API: http://localhost:${port}/api`,
  );

  console.log(
    `Swagger UI: http://localhost:${port}/api/docs`,
  );
}

void bootstrap();