import { User as PrismaUser } from '@generated';
import { User } from '../../../domain/entities/user.entity';

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.name,
      prismaUser.createdAt,
      prismaUser.updatedAt,
    );
  }

  // toPersistence can be added if needed
}
