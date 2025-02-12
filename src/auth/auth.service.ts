import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  login() {
    return { message: 'i have logged in' };
  }

  register() {
    return { message: 'i have registered' };
  }
}
