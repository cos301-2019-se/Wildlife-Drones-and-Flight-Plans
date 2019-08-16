import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { adminPayload } from './admin-payload.interface';
import { UserService } from '../services/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private userService: UserService,
  ) {}

  async createToken(email: string): Promise<any> {
    const user: JwtPayload = { email };
    const accessToken = this.jwtService.sign(user);
    return {
      expiresIn: 3600,
      accessToken,
    };
  }

  async validateUser(payload: JwtPayload) {
    return await this.userService.validateUser(payload);
  }

  async validateAdmin(payload: adminPayload) {
    return await this.userService.validateAdmin(payload);
  }

  validateToken(token) {
    try {
      this.jwtService.verify(token);
      return true;
    } catch (err) {
      return false;
    }
  }
}
