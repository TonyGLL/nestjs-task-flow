import { DomainException } from '@app/common';
import { HttpStatus } from '@nestjs/common';

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('Invalid credentials', HttpStatus.UNAUTHORIZED);
  }
}
