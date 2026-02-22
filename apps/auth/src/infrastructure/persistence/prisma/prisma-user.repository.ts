import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database/prisma.service';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return null;

    return UserMapper.toDomain(user);
  }

  async getUserPassword(userId: string): Promise<string | null> {
    const password = await this.prisma.password.findFirst({
      where: { userId },
      select: { hash: true },
    });
    return password ? password.hash : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return UserMapper.toDomain(user);
  }

  async create(data: Partial<User> & { passwordHash: string }): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email!,
        name: data.name!,
        passwords: {
          create: {
            hash: data.passwordHash,
          },
        },
      },
    });

    return UserMapper.toDomain(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        name: data.name,
      },
    });

    return UserMapper.toDomain(user);
  }

  async updateUserLastLoginAt(id: string, lastLoginAt: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        lastLoginAt,
      },
    });
  }
}
