import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.setGlobalPrefix("api");

  await app.listen(process.env.PORT ?? 3001); //expo ile backendin portunun çakışmaması için backendi 3001e aldık.

  console.log("Code Journey API: http://localhost:3001/api");
}

bootstrap();