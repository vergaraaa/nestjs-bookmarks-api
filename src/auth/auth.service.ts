import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  login() {
    return { message: 'i have logged in' };
  }

  register() {
    return { message: 'i have registered' };
  }
}
