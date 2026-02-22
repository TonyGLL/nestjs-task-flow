import { UserSession } from '../entities/user-session.entity';

export interface SessionRepository {
  create(session: Partial<UserSession>): Promise<UserSession>;
  findByToken(token: string): Promise<UserSession | null>;
  deleteByToken(token: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}

export const SESSION_REPOSITORY = 'SessionRepository';
