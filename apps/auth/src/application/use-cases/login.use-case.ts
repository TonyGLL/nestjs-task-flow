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
import { SESSION_EXPIRATION_MS } from '@app/common';

/**
 * LoginUseCase handles the user authentication logic.
 * It verifies credentials and issues a session token.
 */
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

  /**
   * Orchestrates the login process.
   * 1. Finds the user by email.
   * 2. Retrieves and compares the hashed password.
   * 3. Generates a new JWT token if valid.
   * 4. Creates a new session in the repository.
   * 5. Updates the last login timestamp.
   */
  async execute(dto: LoginDto) {
    // Attempt to find the user in the database.
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    // Retrieve the user's hashed password from a secure source.
    const userPasswordHashed = await this.userRepository.getUserPassword(
      user.id,
    );
    if (!userPasswordHashed) {
      throw new InvalidCredentialsException();
    }

    // Verify the provided password against the stored hash.
    const isPasswordValid = await this.passwordHasher.compare(
      dto.password,
      userPasswordHashed,
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    // Authentication successful, generate a JWT.
    const token = this.tokenService.generate({
      sub: user.id,
      email: user.email,
    });

    // Save the session details.
    await this.sessionRepository.create({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + SESSION_EXPIRATION_MS),
    });

    // Update the last login time for the user.
    await this.userRepository.updateUserLastLoginAt(user.id, new Date());

    return {
      user,
      token,
    };
  }
}
