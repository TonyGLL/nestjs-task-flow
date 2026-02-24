import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUserUseCase } from './register-user.use-case';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { I_PASSWORD_HASHER } from '../ports/password-hasher.interface';
import { I_TOKEN_SERVICE } from '../ports/token-service.interface';
import { SESSION_REPOSITORY } from '../../domain/repositories/session.repository';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { User } from '../../domain/entities/user.entity';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: any;
  let passwordHasher: any;
  let tokenService: any;
  let sessionRepository: any;

  beforeEach(async () => {
    userRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      updateUserLastLoginAt: jest.fn(),
    };
    passwordHasher = {
      hash: jest.fn(),
    };
    tokenService = {
      generate: jest.fn(),
    };
    sessionRepository = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        { provide: USER_REPOSITORY, useValue: userRepository },
        { provide: I_PASSWORD_HASHER, useValue: passwordHasher },
        { provide: I_TOKEN_SERVICE, useValue: tokenService },
        { provide: SESSION_REPOSITORY, useValue: sessionRepository },
      ],
    }).compile();

    useCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should register a new user successfully', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const createdUser = new User(
      'user-id',
      dto.email,
      dto.name,
      null,
      new Date(),
      new Date(),
    );

    userRepository.findByEmail.mockResolvedValue(null);
    passwordHasher.hash.mockResolvedValue('hashed-password');
    userRepository.create.mockResolvedValue(createdUser);
    tokenService.generate.mockReturnValue('jwt-token');
    sessionRepository.create.mockResolvedValue({});

    const result = await useCase.execute(dto);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(passwordHasher.hash).toHaveBeenCalledWith(dto.password);
    expect(userRepository.create).toHaveBeenCalledWith({
      email: dto.email,
      name: dto.name,
      passwordHash: 'hashed-password',
    });
    expect(tokenService.generate).toHaveBeenCalledWith({
      sub: createdUser.id,
      email: createdUser.email,
    });
    expect(sessionRepository.create).toHaveBeenCalled();
    expect(userRepository.updateUserLastLoginAt).toHaveBeenCalledWith(
      createdUser.id,
      expect.any(Date),
    );
    expect(result).toEqual({
      user: createdUser,
      token: 'jwt-token',
    });
  });

  it('should throw UserAlreadyExistsException if email is already registered', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    userRepository.findByEmail.mockResolvedValue({ id: 'existing-id' });

    await expect(useCase.execute(dto)).rejects.toThrow(
      UserAlreadyExistsException,
    );
    expect(userRepository.create).not.toHaveBeenCalled();
  });
});
