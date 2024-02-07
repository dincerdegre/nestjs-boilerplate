import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, UserTokenData } from 'src/types/user.types';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async me(user: UserTokenData): Promise<User> {
    console.log(user);

    const getUser = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });
    if (!getUser) {
      throw new NotFoundException('User not found');
    }
    delete getUser.password;
    const userData = getUser;
    return userData;
  }
}
