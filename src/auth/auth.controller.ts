import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto, AuthRegisterDto } from './dto/Auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: AuthLoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  signup(@Body() dto: AuthRegisterDto) {
    return this.authService.register(dto);
  }
}
