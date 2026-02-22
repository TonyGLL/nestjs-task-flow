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
import { SESSION_EXPIRATION_MS } from '@app/common';

/**
 * RegisterUserUseCase handles the logic for creating a new user in the system.
 * It follows the Clean Architecture pattern, depending only on interfaces (ports).
 */
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

  /**
   * Orchestrates the user registration process.
   * 1. Checks if the user already exists.
   * 2. Hashes the user's password.
   * 3. Creates the user in the repository.
   * 4. Generates an initial JWT token.
   * 5. Creates a session for the user.
   * 6. Updates the last login timestamp.
   */
  async execute(dto: RegisterUserDto) {
    // Check if a user with the given email already exists.
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new UserAlreadyExistsException();
    }

    // Securely hash the password before storing it.
    const passwordHash = await this.passwordHasher.hash(dto.password);

    // Save the new user to the database.
    const createdUser = await this.userRepository.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });

    // Generate a JWT for the new user.
    const token = this.tokenService.generate({
      sub: createdUser.id,
      email: createdUser.email,
    });

    // Persist the session information.
    await this.sessionRepository.create({
      userId: createdUser.id,
      token,
      expiresAt: new Date(Date.now() + SESSION_EXPIRATION_MS),
    });

    // Mark the user as logged in.
    await this.userRepository.updateUserLastLoginAt(createdUser.id, new Date());

    return {
      user: createdUser,
      token,
    };
  }
}
