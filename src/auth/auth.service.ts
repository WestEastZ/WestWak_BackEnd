import { UserDto } from './dto/user.dto';
import { User } from './entity/user.entity';
import { JwtTokenService } from './token/jwt.service';
import { UserRepository } from './user.repository';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private UserRepository: UserRepository,
    private JwtTokenService: JwtTokenService,
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

      return { accessToken, refreshToken };
    } else {
      throw new UnauthorizedException('Login failed');
    }
  }

  // 유저 조회 (인가)
  async findUser(username: string): Promise<User> {
    const verifiedUser = await this.UserRepository.findOne({
      where: { username },
    });

    return verifiedUser;
  }
}
