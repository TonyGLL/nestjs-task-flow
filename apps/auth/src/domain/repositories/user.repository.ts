import { User } from '../entities/user.entity';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  getUserPassword(userId: string): Promise<string | null>;
  findById(id: string): Promise<User | null>;
  create(user: Partial<User> & { passwordHash: string }): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  updateUserLastLoginAt(id: string, lastLoginAt: Date): Promise<void>;
}

export const USER_REPOSITORY = 'UserRepository';
