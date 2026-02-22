import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { AllExceptionsFilter, setupSwagger } from '@app/common';

async function bootstrap() {
  /**
   * Initialize the NestJS application with the AuthModule.
   */
  const app = await NestFactory.create(AuthModule);

  /**
   * Set up global validation pipe.
   * - whitelist: strips away non-whitelisted properties from the DTO.
   * - forbidNonWhitelisted: throws an error if non-whitelisted properties are present.
   * - transform: automatically transforms payloads to be objects typed according to their DTO classes.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /**
   * Apply a global filter to handle all exceptions and provide a consistent error response format.
   */
  app.useGlobalFilters(new AllExceptionsFilter());

  /**
   * Configure Swagger/OpenAPI documentation.
   */
  setupSwagger(app, {
    title: 'Auth Service',
    description: 'The authentication service API description',
    version: '1.0',
    path: 'docs',
  });

  const port = process.env.port ?? 3000;
  await app.listen(port);
  console.log('[Auth service] running on port:', port);
  console.log(
    `[Auth service] swagger docs available at http://localhost:${port}/docs`,
  );
}
void bootstrap();
