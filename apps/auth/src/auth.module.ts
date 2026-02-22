import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '@app/database';
import { JWT_EXPIRATION_TIME } from '@app/common';
import { AuthController } from './presentation/controllers/auth.controller';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { PrismaUserRepository } from './infrastructure/persistence/prisma/prisma-user.repository';
import { SESSION_REPOSITORY } from './domain/repositories/session.repository';
import { PrismaSessionRepository } from './infrastructure/persistence/prisma/prisma-session.repository';
import { I_PASSWORD_HASHER } from './application/ports/password-hasher.interface';
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher.service';
import { I_TOKEN_SERVICE } from './application/ports/token-service.interface';
import { JwtTokenService } from './infrastructure/services/jwt-token.service';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: JWT_EXPIRATION_TIME },
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUserUseCase,
    LoginUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: SESSION_REPOSITORY,
      useClass: PrismaSessionRepository,
    },
    {
      provide: I_PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: I_TOKEN_SERVICE,
      useClass: JwtTokenService,
    },
  ],
})
export class AuthModule {}
