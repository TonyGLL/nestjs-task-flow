import { Inject, Injectable } from '@nestjs/common';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { UserRepository } from '../../domain/repositories/user.repository';
import { I_PASSWORD_HASHER } from '../ports/password-hasher.interface';
import type { IPasswordHasher } from '../ports/password-hasher.interface';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(I_PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(dto: RegisterUserDto) {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new UserAlreadyExistsException();
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    return this.userRepository.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });
  }
}
