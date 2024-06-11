import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class JwtTokenService {
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

    const currentRefreshToken = await this.getRefreshTokenHash(token);
    const currentRefreshTokenExp = await this.getRefreshTokenExp();

    return { currentRefreshToken, currentRefreshTokenExp };
  }

  // Refresh 토큰 해시
  async getRefreshTokenHash(token: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hashToken = await bcrypt.hash(token, salt);
    return hashToken;
  }

  // Refresh 토큰 만료기간
  async getRefreshTokenExp(): Promise<Date> {
    const currentDate = new Date();
    const currentRefreshTokenExp = new Date(
      currentDate.getTime() +
        parseInt(this.configService.get<string>('JWT_REFRESH_TIME')),
    );
    return currentRefreshTokenExp;
  }
}
