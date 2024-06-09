import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Access 토큰
  async getAccessToken(username: string) {
    const payload = { username };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_TIME'),
    });

    return token;
  }

  // Refresh 토큰
  async getRefreshToken(username: string) {
    const payload = { username };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_TIME'),
    });

    return token;
  }
}
