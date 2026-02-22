import { Inject, Injectable } from '@nestjs/common';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { UserRepository } from '../../domain/repositories/user.repository';
import { I_PASSWORD_HASHER } from '../ports/password-hasher.interface';
import type { IPasswordHasher } from '../ports/password-hasher.interface';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import {
  SESSION_REPOSITORY,
  type SessionRepository,
} from '../../domain/repositories/session.repository';
import {
  I_TOKEN_SERVICE,
  type ITokenService,
} from '../ports/token-service.interface';

@Injectable()
export class RegisterUserUseCase {
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

  async execute(dto: RegisterUserDto) {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new UserAlreadyExistsException();
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    const createdUser = await this.userRepository.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });

    const token = this.tokenService.generate({
      sub: createdUser.id,
      email: createdUser.email,
    });

    await this.sessionRepository.create({
      userId: createdUser.id,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
    });

    await this.userRepository.updateUserLastLoginAt(createdUser.id, new Date());

    return {
      user: createdUser,
      token,
    };
  }
}
