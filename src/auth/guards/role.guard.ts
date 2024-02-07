import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from '../roles/roles.decorator';
import { Role } from 'src/enums/user.enums';

export class TokenDto {
  userId: number;
  mail: string;
  role: Role;
  exp: number;
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const userData = request.user as TokenDto;
    for (const role of requiredRoles) {
      if (userData.role === role) {
        return true;
      }
    }

    return false;
  }
}
