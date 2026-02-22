import { User } from '../entities/user.entity';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: Partial<User> & { passwordHash: string }): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
}

export const USER_REPOSITORY = 'UserRepository';
