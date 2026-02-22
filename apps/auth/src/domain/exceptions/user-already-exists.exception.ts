import { DomainException } from '@app/common';
import { HttpStatus } from '@nestjs/common';

export class UserAlreadyExistsException extends DomainException {
  constructor() {
    super('User already exists', HttpStatus.CONFLICT);
  }
}
