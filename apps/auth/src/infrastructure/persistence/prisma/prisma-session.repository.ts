import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database/prisma.service';
import { SessionRepository } from '../../../domain/repositories/session.repository';
import { UserSession } from '../../../domain/entities/user-session.entity';

@Injectable()
export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<UserSession>): Promise<UserSession> {
    const session = await this.prisma.userSession.create({
      data: {
        userId: data.userId!,
        token: data.token!,
        expiresAt: data.expiresAt!,
      },
    });

    return new UserSession(
      session.id,
      session.userId,
      session.token,
      session.expiresAt,
      session.createdAt,
      session.updatedAt,
    );
  }

  async findByToken(token: string): Promise<UserSession | null> {
    const session = await this.prisma.userSession.findUnique({
      where: { token },
    });

    if (!session) return null;

    return new UserSession(
      session.id,
      session.userId,
      session.token,
      session.expiresAt,
      session.createdAt,
      session.updatedAt,
    );
  }

  async deleteByToken(token: string): Promise<void> {
    await this.prisma.userSession.delete({
      where: { token },
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.userSession.deleteMany({
      where: { userId },
    });
  }
}
