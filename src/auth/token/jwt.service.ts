import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AuthProvider } from 'src/types/enum/auth.enum';

@Injectable()
export class JwtTokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Access 토큰
  async getAccessToken(
    username: string,
    userId: number,
    provider: AuthProvider,
  ) {
    const payload = { username, userId, provider };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_TIME'),
    });

    // const decode = this.jwtService.decode(token);

    return token;
  }

  // Refresh 토큰 발급
  async getRefreshToken(
    username: string,
    userId: number,
    provider: AuthProvider,
  ) {
    const payload = { username, userId, provider };

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_TIME'),
    });

    const refreshTokenExp = await this.getRefreshTokenExp();

    return { refreshToken, refreshTokenExp };
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
