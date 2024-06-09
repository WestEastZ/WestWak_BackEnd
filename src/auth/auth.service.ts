import { UserDto } from './dto/user.dto';
import { User } from './entity/user.entity';
import { TokenService } from './token/token.service';
import { UserRepository } from './user.repository';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private UserRepository: UserRepository,
    private TokenService: TokenService,
  ) {}

  // 회원가입
  signUp(UserDto: UserDto): Promise<void> {
    return this.UserRepository.createUser(UserDto);
  }

  // 로그인
  async signin(
    UserDto: UserDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { username, password } = UserDto;

    const user = await this.UserRepository.findOne({ where: { username } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken = await this.TokenService.getAccessToken(username);
      const refreshToken = await this.TokenService.getRefreshToken(username);
      return { accessToken, refreshToken };
    } else {
      throw new UnauthorizedException('Login failed');
    }
  }
}
