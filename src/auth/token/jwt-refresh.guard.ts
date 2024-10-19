import { UserRepository } from './../user.repository';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class JwtRfreshGuard implements CanActivate {
  constructor(
    private UserRepository: UserRepository,
    private JwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();
      Logger.log(
        `Received request: ${request.method} ${request.url} ${request.cookies['refresh_token']}`,
      );

      // const refresh_token = request.cookies['refresh_token'];
      const refresh_token = request.headers.authorization;
      Logger.log(refresh_token);

      // refresh_token 유무 확인
      if (!refresh_token) {
        throw new UnauthorizedException(
          'refresh_token' + 'Refresh token not found',
        );
      }

      // Decode
      const decodedToken = await this.JwtService.verifyAsync(refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN'),
      });

      // user 정보
      const user = await this.UserRepository.findOne({
        where: { username: decodedToken.username },
      });

      // token 비교
      const isMatch = await bcrypt.compare(refresh_token, user.refreshToken);

      // // request 내 refresh_token database refresh_token 비교 확인
      if (!isMatch) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      request.user = user;

      return isMatch;
    } catch (error) {
      throw new UnauthorizedException('error' + 'Invalid refresh token');
    }
  }
}
