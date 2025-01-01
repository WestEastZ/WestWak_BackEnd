import { UserRepository } from '../user.repository';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { User } from '../entity/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private UserRepository: UserRepository,
    private config: ConfigService,
  ) {
    super({
      secretOrKey: config.get<string>('JWT_ACCESS_TOKEN'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload) {
    const { username, userId, provider } = payload;
    const user: User = await this.UserRepository.findOne({
      where: { username, id: userId, provider },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
