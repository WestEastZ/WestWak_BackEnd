import { SocialUserData } from './../types/socialUser/socialUser.type';
import { HttpService } from '@nestjs/axios';
import e, { Response } from 'express';
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
import { firstValueFrom } from 'rxjs';
import { AuthProvider } from 'src/types/enum/auth.enum';

@Injectable()
export class AuthService {
  constructor(
    private UserRepository: UserRepository,
    private JwtTokenService: JwtTokenService,
    private CookieService: CookieService,
    private HttpService: HttpService,
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
        const accessToken = await this.JwtTokenService.getAccessToken(
          username,
          user.id,
          AuthProvider.LOCAL,
        );
        const { refreshToken, refreshTokenExp } =
          await this.JwtTokenService.getRefreshToken(
            username,
            user.id,
            AuthProvider.LOCAL,
          );

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
        '이메일 혹은 비밀번호를 확인해주세요.',
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
  async findUser(user: User): Promise<User> {
    try {
      const verifiedUser = await this.UserRepository.findOne({
        where: {
          username: user.username,
          id: user.id,
          provider: user.provider,
        },
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
  async getNewAccessToken(user: User, res: Response) {
    try {
      const newAccessToken = await this.JwtTokenService.getAccessToken(
        user.username,
        user.id,
        user.provider,
      );

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

  // 카카오 로그인
  async kakaoLogin(code: string, res: Response) {
    // 1. 토큰 발급
    const tokenResponse = await this.getKakaoToken(code);
    if (!tokenResponse.access_token) {
      throw new UnauthorizedException('카카오 토큰 발급에 실패했습니다.');
    }

    // 2. 사용자 정보
    const userResponse = await this.getKaKaoUser(tokenResponse.access_token);
    if (!userResponse.id) {
      throw new UnauthorizedException('카카오 정보를 가져오지 못했습니다.');
    }

    // 3. 사용자 찾기 / 생성
    const user = await this.UserRepository.findOrCreateSocialUser({
      socialId: userResponse.id,
      username: userResponse.properties.nickname,
      provider: AuthProvider.KAKAO,
    });

    // 4. JWT 토큰 발급
    if (user) {
      const username = user.username;
      // 4-1. access token 발급
      const accessToken = await this.JwtTokenService.getAccessToken(
        username,
        user.id,
        AuthProvider.KAKAO,
      );
      // 4-2. refresh token 발급
      const { refreshToken, refreshTokenExp } =
        await this.JwtTokenService.getRefreshToken(
          username,
          user.id,
          AuthProvider.KAKAO,
        );
      // 4-3. 기존 refresh token 수정
      await this.UserRepository.update(
        { username },
        {
          refreshToken:
            await this.JwtTokenService.getRefreshTokenHash(refreshToken),
          refreshTokenExp,
        },
      );
      // 4-4. token cookie 저장
      this.CookieService.setAccessTokenCookie(res, accessToken);
      this.CookieService.setRefreshTokenCookie(res, refreshToken);

      return {
        id: user.id,
        username,
        accessToken,
        refreshToken,
        message: '로그인 되었습니다',
      };
    }
  }

  // 구글 로그인
  async googleLogin(code: string, res: Response) {
    // 1. 토큰 발급
    const tokenResponse = await this.getGoggleToken(code);
    if (!tokenResponse.access_token) {
      throw new UnauthorizedException('구글 토큰 발급에 실패했습니다.');
    }

    // 2. 사용자 정보
    const userResponse = await this.getGoogleUser(tokenResponse.access_token);
    if (!userResponse.id) {
      throw new UnauthorizedException('구글 정보를 가져오지 못했습니다.');
    }

    // 3. 사용자 찾기 / 생성
    const user = await this.UserRepository.findOrCreateSocialUser({
      socialId: userResponse.id,
      username: userResponse.name,
      provider: AuthProvider.GOOGLE,
    });

    // 4. JWT 토큰 발급
    if (user) {
      const username = user.username;
      // 4-1. access token 발급
      const accessToken = await this.JwtTokenService.getAccessToken(
        username,
        user.id,
        AuthProvider.GOOGLE,
      );
      // 4-2. refresh token 발급
      const { refreshToken, refreshTokenExp } =
        await this.JwtTokenService.getRefreshToken(
          username,
          user.id,
          AuthProvider.GOOGLE,
        );
      // 4-3. 기존 refresh token 수정
      await this.UserRepository.update(
        { username, id: user.id },
        {
          refreshToken:
            await this.JwtTokenService.getRefreshTokenHash(refreshToken),
          refreshTokenExp,
        },
      );
      // 4-4. token cookie 저장
      this.CookieService.setAccessTokenCookie(res, accessToken);
      this.CookieService.setRefreshTokenCookie(res, refreshToken);

      return {
        id: user.id,
        username,
        accessToken,
        refreshToken,
        provider: user.provider,
        message: '로그인 되었습니다',
      };
    }
  }

  // 깃허브 로그인
  async githubLogin(code: string, res: Response) {
    // 1. 토큰 발급
    const tokenResponse = await this.getGithubToken(code);
    if (!tokenResponse.access_token) {
      throw new UnauthorizedException('구글 토큰 발급에 실패했습니다.');
    }

    // 2. 사용자 정보
    const userResponse = await this.getGithubUser(tokenResponse.access_token);
    if (!userResponse.id) {
      throw new UnauthorizedException('구글 정보를 가져오지 못했습니다.');
    }

    // 3. 사용자 찾기 / 생성
    const user = await this.UserRepository.findOrCreateSocialUser({
      socialId: userResponse.id,
      username: userResponse.name,
      provider: AuthProvider.GITHUB,
    });

    // 4. JWT 토큰 발급
    if (user) {
      const username = user.username;
      // 4-1. access token 발급
      const accessToken = await this.JwtTokenService.getAccessToken(
        username,
        user.id,
        AuthProvider.GITHUB,
      );
      // 4-2. refresh token 발급
      const { refreshToken, refreshTokenExp } =
        await this.JwtTokenService.getRefreshToken(
          username,
          user.id,
          AuthProvider.GITHUB,
        );
      // 4-3. 기존 refresh token 수정
      await this.UserRepository.update(
        { username, id: user.id },
        {
          refreshToken:
            await this.JwtTokenService.getRefreshTokenHash(refreshToken),
          refreshTokenExp,
        },
      );
      // 4-4. token cookie 저장
      this.CookieService.setAccessTokenCookie(res, accessToken);
      this.CookieService.setRefreshTokenCookie(res, refreshToken);

      return {
        id: user.id,
        username,
        accessToken,
        refreshToken,
        provider: user.provider,
        message: '로그인 되었습니다',
      };
    }
  }

  // 카카오 토큰 발급
  private async getKakaoToken(code: string) {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', process.env.KAKAO_CLIENT_ID);
    params.append('redirect_uri', process.env.KAKAO_REDIRECT_URL);
    params.append('code', code);
    params.append('client_secret', process.env.KAKAO_CLIENT_SECRET);

    const { data } = await firstValueFrom(
      this.HttpService.post('https://kauth.kakao.com/oauth/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      }),
    );

    return data;
  }

  // 카카오 유저 정보 발급
  private async getKaKaoUser(accessToken: string) {
    const { data } = await firstValueFrom(
      this.HttpService.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      }),
    );

    return data;
  }

  // 구글 토큰 발급
  private async getGoggleToken(code: string) {
    const params = new URLSearchParams();

    params.append('grant_type', 'authorization_code');
    params.append('client_id', process.env.GOOGLE_CLIENT_ID);
    params.append('redirect_uri', process.env.GOOGLE_REDIRECT_URL);
    params.append('code', code);
    params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);

    const { data } = await firstValueFrom(
      this.HttpService.post('https://oauth2.googleapis.com/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
    );

    return data;
  }

  // 구글 유저 정보 발급
  private async getGoogleUser(accessToken: string) {
    const { data } = await firstValueFrom(
      this.HttpService.get(`https://www.googleapis.com/oauth2/v2/userinfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );

    return data;
  }

  // 깃허브 토큰 발급
  private async getGithubToken(code: string) {
    const params = new URLSearchParams();

    params.append('client_id', process.env.GITHUB_CLIENT_ID);
    params.append('redirect_uri', process.env.GITHUB_REDIRECT_URL);
    params.append('code', code);
    params.append('client_secret', process.env.GITHUB_CLIENT_SECRET);

    const { data } = await firstValueFrom(
      this.HttpService.post(
        'https://github.com/login/oauth/access_token',
        params,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      ),
    );

    return data;
  }

  // 깃허브 유저 정보 발급
  private async getGithubUser(accessToken: string) {
    const { data } = await firstValueFrom(
      this.HttpService.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );

    return data;
  }
}
