import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { JwtAccessGuard } from './token/jwt-access.guard';
import { Response } from 'express';
import { User } from './entity/user.entity';

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
  async signin(
    @Body(ValidationPipe) UserDto: UserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const tokens = await this.AuthService.signin(UserDto);

    res.cookie('access_token', `Bearer ${tokens.accessToken}`, {
      httpOnly: true,
    });
    res.cookie('refresh_token', tokens.currentRefreshToken, {
      httpOnly: true,
    });

    return {
      message: 'login',
      access_token: tokens.accessToken,
      refresh_token: tokens.currentRefreshToken,
    };
  }

  // 권한 확인
  @Get('/authenticate')
  @UseGuards(JwtAccessGuard)
  async user(@Req() req: any, @Res() res: Response) {
    const username = req.user.username;
    const verifiedUser: User = await this.AuthService.findUser(username);

    return res.send(verifiedUser);
  }
}
