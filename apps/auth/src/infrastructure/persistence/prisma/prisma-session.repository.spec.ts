import { Test, TestingModule } from '@nestjs/testing';
import { PrismaSessionRepository } from './prisma-session.repository';
import { PrismaService } from '@app/database/prisma.service';

describe('PrismaSessionRepository', () => {
  let repository: PrismaSessionRepository;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      userSession: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaSessionRepository,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    repository = module.get<PrismaSessionRepository>(PrismaSessionRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should upsert a session and return it', async () => {
      const data = { userId: '1', token: 't', expiresAt: new Date() };
      const prismaSession = { id: 's1', ...data, createdAt: new Date(), updatedAt: new Date() };
      prismaService.userSession.upsert.mockResolvedValue(prismaSession);

      const result = await repository.create(data);

      expect(prismaService.userSession.upsert).toHaveBeenCalled();
      expect(result.id).toBe(prismaSession.id);
      expect(result.token).toBe(prismaSession.token);
    });
  });

  describe('findByToken', () => {
    it('should return a session if found', async () => {
      const prismaSession = { id: 's1', userId: '1', token: 't', expiresAt: new Date(), createdAt: new Date(), updatedAt: new Date() };
      prismaService.userSession.findUnique.mockResolvedValue(prismaSession);

      const result = await repository.findByToken('t');

      expect(result?.id).toBe(prismaSession.id);
    });
  });

  describe('deleteByToken', () => {
    it('should delete a session', async () => {
      await repository.deleteByToken('t');
      expect(prismaService.userSession.delete).toHaveBeenCalledWith({ where: { token: 't' } });
    });
  });

  describe('deleteByUserId', () => {
    it('should delete all sessions for a user', async () => {
      await repository.deleteByUserId('u1');
      expect(prismaService.userSession.deleteMany).toHaveBeenCalledWith({ where: { userId: 'u1' } });
    });
  });
});
