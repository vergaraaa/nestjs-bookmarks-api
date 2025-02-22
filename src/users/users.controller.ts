import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../../src/auth/decorators/get-user.decorator';

import { JwtGuard } from '../../src/auth/guards/jwt.guard';
import { PrismaService } from '../../src/prisma/prisma.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }
}
