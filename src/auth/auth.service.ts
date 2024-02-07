import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthLoginDto, AuthRegisterDto } from './dto/Auth.dto';
import * as argon from 'argon2';
import { User } from 'src/types/user.types';
import { Role, Status } from 'src/enums/user.enums';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: AuthLoginDto): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
      // if user not exist throw error
      if (!user) {
        throw new NotFoundException('User not found');
      }
      // compare the password
      const isPasswordMatch = await argon.verify(user.password, dto.password);
      // if password is wrong throw error
      if (!isPasswordMatch) {
        throw new UnauthorizedException('Password is wrong');
      }
      // if user is not active throw error
      if (user && user.status === Status.PASSIVE) {
        throw new UnauthorizedException('User not active');
      }
      let tokenExpireData = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
      if (dto.rememberMe) {
        tokenExpireData = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365;
      }
      // generate token
      const token = await this.signToken(
        user.id,
        user.email,
        user.role,
        user.status,
        dto.rememberMe,
      );
      const userData: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        role: user.role,
        status: user.status,
        exp: tokenExpireData,
        token: token,
      };
      return userData;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new Error('Prisma Error');
      }
      throw error;
    }
  }

  async register(dto: AuthRegisterDto): Promise<any> {
    if (dto.password !== dto.passwordConfirm) {
      throw new ForbiddenException('Passwords do not match');
    }
    const roleExists = Object.values(Role).includes(dto.role as Role);
    if (!roleExists) {
      throw new ForbiddenException('Role not found');
    }
    // check if user already exist create hashed password
    const passwordHash = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          surname: dto.surname,
          email: dto.email,
          phone: dto.phone,
          password: passwordHash,
          role: dto.role,
        },
      });
      if (!user) {
        throw new ForbiddenException('User not created');
      }
      const tokenExpireData = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
      // generate token
      const token = await this.signToken(
        user.id,
        user.email,
        user.role,
        user.status,
        false,
      );
      const userData: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        role: user.role,
        status: user.status,
        exp: tokenExpireData,
        token: token,
      };
      return userData;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'This email address has been used before',
          );
        }
        throw new ForbiddenException('Prisma Error');
      }
      throw error;
    }
  }

  signToken(
    userId: number,
    email: string,
    role: string,
    status: string,
    rememberMe?: boolean,
  ): Promise<string> {
    const payload = {
      sub: userId,
      email: email,
      role: role,
      status: status,
    };
    const secret = this.config.get('JWT_SECRET');
    return this.jwt.signAsync(payload, {
      expiresIn: rememberMe ? '365d' : '1d',
      secret: secret,
    });
  }
}
