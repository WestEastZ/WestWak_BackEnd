import { AuthService } from './auth.service';
import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { UserDto } from './dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private AuthService: AuthService) {}

  // 회원가입
  @Post('/signup')
  signup(@Body(ValidationPipe) UserDto: UserDto): Promise<void> {
    return this.AuthService.signUp(UserDto);
  }

  // 로그인
  @Post('/signin')
  signin(
    @Body(ValidationPipe) UserDto: UserDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.AuthService.signin(UserDto);
  }
}
