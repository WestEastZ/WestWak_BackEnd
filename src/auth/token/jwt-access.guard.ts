import { JwtService } from '@nestjs/jwt';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * guard는 CanActivate 함수는 implement한다.
 * 현재의 request가 실행될 수 있는지 없는지를 나타내는 boolean을 리턴한다.
 * ture -> 실행
 * false -> 거절
 */

@Injectable()
export class JwtAccessGuard implements CanActivate {
  constructor(
    private JwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * canActivate
   * ExecutionContext -> context에 관한 더 구체적인 정보를 제공한다.
   * http context 기준, 해당 요청을 다루는 handler와 그 handler가 속한 controller class
   *
   */
  async canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();
      Logger.log(
        `Received request: ${request.method} ${request.url} ${request.cookies['access_token']}`,
      );

      const access_token = request.cookies['access_token'];

      // access_token 유무 확인
      if (!access_token) {
        throw new UnauthorizedException('Access token not found');
      }

      // 토큰 분리
      const [scheme, token] = access_token.split(' ');

      // scheme 확인
      if (scheme !== 'Bearer') {
        throw new UnauthorizedException('Invalid token scheme');
      }

      const user = await this.JwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN'),
      });

      request.user = user;

      return user;
    } catch (error) {
      // 토큰 만료 시 401코드 반환
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Access token expired');
      }
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
