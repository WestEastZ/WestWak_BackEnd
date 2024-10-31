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
      path: '/',
    },
    REFRESH_TOKEN: {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      maxAge: 6000000,
      path: '/',
    },
  };

  setAuthCookie(
    res: Response,
    {
      accessToken,
      refreshToken,
    }: { accessToken: string; refreshToken: string },
  ) {
    res.cookie(
      'access_token',
      `Bearer ${accessToken}`,
      this.COOKIE_CONFIG.ACCESS_TOKEN,
    );
    res.cookie(
      'refresh_token',
      `${refreshToken}`,
      this.COOKIE_CONFIG.REFRESH_TOKEN,
    );
  }

  clearAuthCookies(res: Response) {
    res.clearCookie('access_token', this.COOKIE_CONFIG.ACCESS_TOKEN);
    res.clearCookie('refresh_token', this.COOKIE_CONFIG.REFRESH_TOKEN);
  }
}
