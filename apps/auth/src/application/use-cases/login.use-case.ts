import { Inject, Injectable } from '@nestjs/common';
import { LoginDto } from '../dtos/login.dto';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { UserRepository } from '../../domain/repositories/user.repository';
import { I_PASSWORD_HASHER } from '../ports/password-hasher.interface';
import type { IPasswordHasher } from '../ports/password-hasher.interface';
import { I_TOKEN_SERVICE } from '../ports/token-service.interface';
import type { ITokenService } from '../ports/token-service.interface';
import { SESSION_REPOSITORY } from '../../domain/repositories/session.repository';
import type { SessionRepository } from '../../domain/repositories/session.repository';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(I_PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(I_TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(dto: LoginDto) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const userPasswordHashed = await this.userRepository.getUserPassword(
      user.id,
    );
    if (!userPasswordHashed) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await this.passwordHasher.compare(
      dto.password,
      userPasswordHashed,
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const token = this.tokenService.generate({
      sub: user.id,
      email: user.email,
    });

    await this.sessionRepository.create({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
    });

    await this.userRepository.updateUserLastLoginAt(user.id, new Date());

    return {
      user,
      token,
    };
  }
}
