import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCase } from './login.use-case';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { I_PASSWORD_HASHER } from '../ports/password-hasher.interface';
import { I_TOKEN_SERVICE } from '../ports/token-service.interface';
import { SESSION_REPOSITORY } from '../../domain/repositories/session.repository';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { User } from '../../domain/entities/user.entity';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: any;
  let passwordHasher: any;
  let tokenService: any;
  let sessionRepository: any;

  beforeEach(async () => {
    userRepository = {
      findByEmail: jest.fn(),
      getUserPassword: jest.fn(),
      updateUserLastLoginAt: jest.fn(),
    };
    passwordHasher = {
      compare: jest.fn(),
    };
    tokenService = {
      generate: jest.fn(),
    };
    sessionRepository = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: USER_REPOSITORY, useValue: userRepository },
        { provide: I_PASSWORD_HASHER, useValue: passwordHasher },
        { provide: I_TOKEN_SERVICE, useValue: tokenService },
        { provide: SESSION_REPOSITORY, useValue: sessionRepository },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should login successfully with valid credentials', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const user = new User(
      'user-id',
      dto.email,
      'Test User',
      null,
      new Date(),
      new Date(),
    );

    userRepository.findByEmail.mockResolvedValue(user);
    userRepository.getUserPassword.mockResolvedValue('hashed-password');
    passwordHasher.compare.mockResolvedValue(true);
    tokenService.generate.mockReturnValue('jwt-token');
    sessionRepository.create.mockResolvedValue({});

    const result = await useCase.execute(dto);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(userRepository.getUserPassword).toHaveBeenCalledWith(user.id);
    expect(passwordHasher.compare).toHaveBeenCalledWith(
      dto.password,
      'hashed-password',
    );
    expect(tokenService.generate).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
    });
    expect(sessionRepository.create).toHaveBeenCalled();
    expect(userRepository.updateUserLastLoginAt).toHaveBeenCalledWith(
      user.id,
      expect.any(Date),
    );
    expect(result).toEqual({
      user,
      token: 'jwt-token',
    });
  });

  it('should throw InvalidCredentialsException if user not found', async () => {
    const dto = {
      email: 'nonexistent@example.com',
      password: 'password123',
    };

    userRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('should throw InvalidCredentialsException if password not found', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
    };

    userRepository.findByEmail.mockResolvedValue({ id: 'user-id' });
    userRepository.getUserPassword.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('should throw InvalidCredentialsException if password does not match', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'wrong-password',
    };

    userRepository.findByEmail.mockResolvedValue({ id: 'user-id' });
    userRepository.getUserPassword.mockResolvedValue('hashed-password');
    passwordHasher.compare.mockResolvedValue(false);

    await expect(useCase.execute(dto)).rejects.toThrow(
      InvalidCredentialsException,
    );
  });
});
