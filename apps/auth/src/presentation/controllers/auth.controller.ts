import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUserDto } from '../../application/dtos/register-user.dto';
import { LoginDto } from '../../application/dtos/login.dto';

/**
 * AuthController handles incoming HTTP requests related to authentication.
 * It delegates the business logic to specific use cases.
 */
@ApiTags('Auth Controller')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  /**
   * Endpoint to register a new user.
   */
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() dto: RegisterUserDto) {
    // Delegates registration to RegisterUserUseCase.
    return this.registerUserUseCase.execute(dto);
  }

  /**
   * Endpoint to authenticate an existing user.
   */
  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() dto: LoginDto) {
    // Delegates login to LoginUseCase.
    return this.loginUseCase.execute(dto);
  }
}
