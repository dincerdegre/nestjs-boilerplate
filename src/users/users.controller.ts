import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { UsersService } from './users.service';
import { UserTokenData } from 'src/types/user.types';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('me')
  me(@Req() req: Request & { user: UserTokenData }) {
    return this.userService.me(req.user);
  }
}
