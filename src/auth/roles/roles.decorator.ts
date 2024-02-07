import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/enums/user.enums';

export const ROLE_KEY = 'role';

export const Roles = (...role: Role[]) => SetMetadata(ROLE_KEY, role);
