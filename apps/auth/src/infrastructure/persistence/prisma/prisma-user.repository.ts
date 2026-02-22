import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database/prisma.service';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';

/**
 * PrismaUserRepository is a concrete implementation of the UserRepository interface
 * using Prisma ORM. It interacts directly with the database.
 */
@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds a user by their email address.
   * Returns a domain entity or null if not found.
   */
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

    // Map database record to domain entity.
    return UserMapper.toDomain(user);
  }

  /**
   * Retrieves the hashed password for a specific user.
   */
  async getUserPassword(userId: string): Promise<string | null> {
    const password = await this.prisma.password.findFirst({
      where: { userId },
      select: { hash: true },
    });
    return password ? password.hash : null;
  }

  /**
   * Finds a user by their unique ID.
   */
  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return UserMapper.toDomain(user);
  }

  /**
   * Creates a new user and their associated password hash in a single transaction.
   */
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

  /**
   * Updates basic user profile information.
   */
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

  /**
   * Updates the user's last login timestamp.
   */
  async updateUserLastLoginAt(id: string, lastLoginAt: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        lastLoginAt,
      },
    });
  }
}
