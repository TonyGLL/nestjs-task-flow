import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { AllExceptionsFilter, setupSwagger } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  setupSwagger(app, {
    title: 'Auth Service',
    description: 'The authentication service API description',
    version: '1.0',
    path: 'docs',
  });

  const port = process.env.port ?? 3000;
  await app.listen(port);
  console.log(`[Auth service] running on port ${port}`);
  console.log(`[Auth service] swagger docs available at http://localhost:${port}/docs`);
}
void bootstrap();
