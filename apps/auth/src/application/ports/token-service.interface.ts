export interface ITokenService {
  generate(payload: any): string;
  verify(token: string): any;
}

export const I_TOKEN_SERVICE = 'ITokenService';
