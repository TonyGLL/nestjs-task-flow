import { Test, TestingModule } from '@nestjs/testing';
import { JwtTokenService } from './jwt-token.service';
import { JwtService } from '@nestjs/jwt';

describe('JwtTokenService', () => {
  let service: JwtTokenService;
  let jwtService: any;

  beforeEach(async () => {
    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtTokenService,
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<JwtTokenService>(JwtTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generate', () => {
    it('should call jwtService.sign with correct payload', () => {
      const payload = { sub: '1', email: 'test@example.com' };
      jwtService.sign.mockReturnValue('jwt-token');

      const result = service.generate(payload);

      expect(jwtService.sign).toHaveBeenCalledWith(payload);
      expect(result).toBe('jwt-token');
    });
  });

  describe('verify', () => {
    it('should call jwtService.verify with correct token', () => {
      const token = 'jwt-token';
      const payload = { sub: '1', email: 'test@example.com' };
      jwtService.verify.mockReturnValue(payload);

      const result = service.verify(token);

      expect(jwtService.verify).toHaveBeenCalledWith(token);
      expect(result).toBe(payload);
    });
  });
});
