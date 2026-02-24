import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';

describe('AuthController', () => {
  let controller: AuthController;
  let registerUserUseCase: any;
  let loginUseCase: any;

  beforeEach(async () => {
    registerUserUseCase = {
      execute: jest.fn(),
    };
    loginUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: RegisterUserUseCase, useValue: registerUserUseCase },
        { provide: LoginUseCase, useValue: loginUseCase },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call registerUserUseCase.execute with correct dto', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const expectedResult = { user: { id: '1' }, token: 'token' };
      registerUserUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.register(dto);

      expect(registerUserUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should call loginUseCase.execute with correct dto', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = { user: { id: '1' }, token: 'token' };
      loginUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.login(dto);

      expect(loginUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });
});
