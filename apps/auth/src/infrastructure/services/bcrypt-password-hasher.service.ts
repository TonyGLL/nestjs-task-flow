import { Injectable } from '@nestjs/common';
import { IPasswordHasher } from '../../application/ports/password-hasher.interface';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    return await bcryptjs.hash(password, 10);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return await bcryptjs.compare(password, hash);
  }
}
