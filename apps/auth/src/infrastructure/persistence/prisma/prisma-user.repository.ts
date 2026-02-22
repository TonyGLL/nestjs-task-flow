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
      include: { passwords: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    if (!user) return null;

    const domainUser = UserMapper.toDomain(user);
    // We attach the password hash for the use case to use.
    // In a more complex domain, we might handle this differently.
    (domainUser as any).passwordHash = user.passwords[0]?.hash;

    return domainUser;
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
}
