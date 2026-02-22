import { Injectable } from '@nestjs/common';
import { IPasswordHasher } from '../../application/ports/password-hasher.interface';

@Injectable()
export class BunPasswordHasher implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    return Bun.password.hash(password, {
      algorithm: 'bcrypt',
      cost: 10,
    });
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return Bun.password.verify(password, hash);
  }
}
