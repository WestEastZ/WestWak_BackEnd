import { Response } from 'express';
import { CookieService } from './cookie/cookie.service';
import { UserDto } from './dto/user.dto';
import { User } from './entity/user.entity';
import { JwtTokenService } from './token/jwt.service';
import { UserRepository } from './user.repository';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private UserRepository: UserRepository,
    private JwtTokenService: JwtTokenService,
    private CookieService: CookieService,
  ) {}

  // 회원가입
  signUp(UserDto: UserDto): Promise<{ username: string; message: string }> {
    try {
      return this.UserRepository.createUser(UserDto);
    } catch (error) {
      throw new HttpException(
        '회원가입이 실패했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 로그인
  async signin(
    UserDto: UserDto,
    res: Response,
  ): Promise<{
    id: number;
    username: string;
    accessToken: string;
    refreshToken: string;
    message: string;
  }> {
    try {
      const { username, password } = UserDto;

      const user = await this.UserRepository.findOne({
        where: { username },
      });

      if (user && (await bcrypt.compare(password, user.password))) {
        const accessToken = await this.JwtTokenService.getAccessToken(username);
        const { refreshToken, refreshTokenExp } =
          await this.JwtTokenService.getRefreshToken(username);

        // 유저 Refresh 토큰 수정
        await this.UserRepository.update(
          { username },
          {
            refreshToken:
              await this.JwtTokenService.getRefreshTokenHash(refreshToken),
            refreshTokenExp,
          },
        );

        this.CookieService.setAccessTokenCookie(res, accessToken);
        this.CookieService.setRefreshTokenCookie(res, refreshToken);

        return {
          id: user.id,
          username,
          accessToken,
          refreshToken,
          message: '로그인 되었습니다',
        };
      } else {
        throw new UnauthorizedException('로그인이 실패했습니다.');
      }
    } catch (error) {
      throw new HttpException(
        '로그인 처리 중 오류가 발생했습니다. .',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 로그아웃
  async logout(res: Response) {
    try {
      this.CookieService.clearAuthCookies(res);
      return { message: '로그아웃 되었습니다.' };
    } catch (error) {
      throw new HttpException(
        '로그아웃 처리 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 유저 조회 (인가)
  async findUser(username: string): Promise<User> {
    try {
      const verifiedUser = await this.UserRepository.findOne({
        where: { username },
      });

      return verifiedUser;
    } catch (error) {
      throw new HttpException(
        '사용자를 찾을 수 없습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // access token 재발급
  async getNewAccessToken(username: string, res: Response) {
    try {
      const newAccessToken =
        await this.JwtTokenService.getAccessToken(username);

      this.CookieService.setAccessTokenCookie(res, newAccessToken);

      return {
        message: 'new Access Token',
        access_token: `Bearer ${newAccessToken}`,
      };
    } catch (error) {
      throw new HttpException(
        'Refresh Token 재발급 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
