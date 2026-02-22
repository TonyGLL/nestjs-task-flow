import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export interface SwaggerConfig {
  title: string;
  description: string;
  version: string;
  path?: string;
}

export function setupSwagger(app: INestApplication, config: SwaggerConfig) {
  const options = new DocumentBuilder()
    .setTitle(config.title)
    .setDescription(config.description)
    .setVersion(config.version)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  const path = config.path || 'docs';
  SwaggerModule.setup(path, app, document);
}
