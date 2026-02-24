import { Test, TestingModule } from '@nestjs/testing';
import { BcryptPasswordHasher } from './bcrypt-password-hasher.service';
import * as bcryptjs from 'bcryptjs';

jest.mock('bcryptjs');

describe('BcryptPasswordHasher', () => {
  let service: BcryptPasswordHasher;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BcryptPasswordHasher],
    }).compile();

    service = module.get<BcryptPasswordHasher>(BcryptPasswordHasher);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('should call bcryptjs.hash with correct arguments', async () => {
      const password = 'password123';
      (bcryptjs.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.hash(password);

      expect(bcryptjs.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe('hashed-password');
    });
  });

  describe('compare', () => {
    it('should call bcryptjs.compare with correct arguments', async () => {
      const password = 'password123';
      const hash = 'hashed-password';
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.compare(password, hash);

      expect(bcryptjs.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(true);
    });
  });
});
