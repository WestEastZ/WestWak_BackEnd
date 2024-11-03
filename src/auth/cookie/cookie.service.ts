import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class CookieService {
  constructor() {}

  private readonly COOKIE_CONFIG = {
    ACCESS_TOKEN: {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      maxAge: 10000,
      domain: process.env.NODE_ENV === 'development' ? '' : '.wakvideo.shop',
      path: '/',
    },
    REFRESH_TOKEN: {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      maxAge: 6000000,
      domain: process.env.NODE_ENV === 'development' ? '' : '.wakvideo.shop',
      path: '/',
    },
  };

  setAccessTokenCookie(res: Response, accessToken: string) {
    res.cookie(
      'access_token',
      `Bearer ${accessToken}`,
      this.COOKIE_CONFIG.ACCESS_TOKEN,
    );
  }

  setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie(
      'refresh_token',
      `${refreshToken}`,
      this.COOKIE_CONFIG.REFRESH_TOKEN,
    );
  }

  clearAuthCookies(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }
}
