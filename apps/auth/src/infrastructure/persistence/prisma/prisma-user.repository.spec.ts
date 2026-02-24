import { Test, TestingModule } from '@nestjs/testing';
import { PrismaUserRepository } from './prisma-user.repository';
import { PrismaService } from '@app/database/prisma.service';
import { UserMapper } from '../mappers/user.mapper';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      password: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaUserRepository,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    repository = module.get<PrismaUserRepository>(PrismaUserRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      const prismaUser = { id: '1', email: 'test@example.com', name: 'Test' };
      prismaService.user.findUnique.mockResolvedValue(prismaUser);
      jest.spyOn(UserMapper, 'toDomain').mockReturnValue(prismaUser as any);

      const result = await repository.findByEmail('test@example.com');

      expect(prismaService.user.findUnique).toHaveBeenCalled();
      expect(result).toEqual(prismaUser);
    });

    it('should return null if not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toBeNull();
    });
  });

  describe('getUserPassword', () => {
    it('should return the password hash if found', async () => {
      prismaService.password.findFirst.mockResolvedValue({ hash: 'hashed' });

      const result = await repository.getUserPassword('1');

      expect(result).toBe('hashed');
    });

    it('should return null if password not found', async () => {
      prismaService.password.findFirst.mockResolvedValue(null);

      const result = await repository.getUserPassword('1');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a user and return it', async () => {
      const data = { email: 't@t.com', name: 'N', passwordHash: 'H' };
      const prismaUser = { id: '1', email: 't@t.com', name: 'N' };
      prismaService.user.create.mockResolvedValue(prismaUser);
      jest.spyOn(UserMapper, 'toDomain').mockReturnValue(prismaUser as any);

      const result = await repository.create(data);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: data.email,
          name: data.name,
          passwords: { create: { hash: data.passwordHash } },
        }),
      });
      expect(result).toEqual(prismaUser);
    });
  });

  describe('updateUserLastLoginAt', () => {
    it('should update lastLoginAt', async () => {
      const date = new Date();
      await repository.updateUserLastLoginAt('1', date);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { lastLoginAt: date },
      });
    });
  });
});
