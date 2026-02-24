import { UserMapper } from './user.mapper';
import { User as PrismaUser } from '@generated';

describe('UserMapper', () => {
  describe('toDomain', () => {
    it('should map PrismaUser to User domain entity', () => {
      const prismaUser: PrismaUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed-password',
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = UserMapper.toDomain(prismaUser);

      expect(result.id).toBe(prismaUser.id);
      expect(result.email).toBe(prismaUser.email);
      expect(result.name).toBe(prismaUser.name);
      expect(result.lastLoginAt).toBe(prismaUser.lastLoginAt);
      expect(result.createdAt).toBe(prismaUser.createdAt);
      expect(result.updatedAt).toBe(prismaUser.updatedAt);
    });
  });
});
