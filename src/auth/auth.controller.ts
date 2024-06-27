import { JwtTokenService } from './token/jwt.service';
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
import { JwtRfreshGuard } from './token/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private AuthService: AuthService,
    private JwtTokenService: JwtTokenService,
  ) {}

  // 회원가입
  @Post('/signup')
  signup(
    @Body(ValidationPipe) UserDto: UserDto,
  ): Promise<{ username: string; message: string }> {
    return this.AuthService.signUp(UserDto);
  }

  // 로그인
  @Post('/signin')
  async signin(
    @Body(ValidationPipe) UserDto: UserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const response = await this.AuthService.signin(UserDto);

    res.cookie('access_token', `Bearer ${response.accessToken}`, {
      httpOnly: true,
    });
    res.cookie('refresh_token', response.refreshToken, {
      httpOnly: true,
    });

    return {
      username: response.username,
      access_token: response.accessToken,
      refresh_token: response.refreshToken,
      message: response.message,
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

  // refresh 토큰 재발급
  @Post('/refresh')
  @UseGuards(JwtRfreshGuard)
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const newAccessToken = await this.JwtTokenService.getAccessToken(
      req.user.username,
    );

    res.cookie('access_token', `Bearer ${newAccessToken}`, {
      httpOnly: true,
    });

    return {
      message: 'new Access Token',
      access_token: newAccessToken,
    };
  }
}
