export class InvalidCredentialsException extends Error {
  constructor() {
    super('Invalid credentials');
    this.name = 'InvalidCredentialsException';
  }
}
