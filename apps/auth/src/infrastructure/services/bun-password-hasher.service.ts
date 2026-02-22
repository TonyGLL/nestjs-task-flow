import { Injectable } from '@nestjs/common';
import { IPasswordHasher } from '../../application/ports/password-hasher.interface';
import bcryptjs from 'node_modules/bcryptjs';

@Injectable()
export class BunPasswordHasher implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    return await bcryptjs.hash(password, 10);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return await bcryptjs.compare(password, hash);
  }
}
