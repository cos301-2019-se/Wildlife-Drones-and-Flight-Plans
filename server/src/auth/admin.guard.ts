import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { User } from '../entity/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    return user.jobType === 'administrator';
  }
}