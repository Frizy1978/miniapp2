import "reflect-metadata";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";

import type { AppEnvironment } from "./common/config/env";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<AppEnvironment, true>);
  const corsOrigin = configService.get("app.corsOrigin", { infer: true });
  const port = configService.get("app.port", { infer: true });

  app.enableCors({
    origin: corsOrigin
  });
  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: false,
      transform: true,
      whitelist: true
    })
  );
  app.setGlobalPrefix("api");

  await app.listen(port);
}

void bootstrap();
