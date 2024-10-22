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
import { Response } from 'express';
import { User } from './entity/user.entity';
import { JwtRfreshGuard } from './token/jwt-refresh.guard';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorator/getUser.decorator';

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
      // sameSite: 'none',
      // secure: true,
      maxAge: 10000,
      path: '/',
    });

    res.cookie('refresh_token', response.refreshToken, {
      httpOnly: true,
      // sameSite: 'none',
      // secure: true,
      maxAge: 6000000,
      path: '/',
    });

    res.send({
      id: response.id,
      username: response.username,
      access_token: response.accessToken,
      refresh_token: response.refreshToken,
      message: response.message,
    });
  }

  // kakao 로그인
  @Get('/kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth(@Req() req) {}

  @Get('/auth/kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuthRedirect(@Req() req, @Res() res: Response) {}

  // 로그아웃
  @Post('/logout')
  async logout(@Res() res: Response): Promise<any> {
    res.clearCookie('access_token', {
      httpOnly: true,
      // sameSite: 'none',
      // secure: true,
      maxAge: 10000,
      path: '/',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      // sameSite: 'none',
      // secure: true,
      maxAge: 6000000,
      path: '/',
    });

    res.send({
      message: '로그아웃 되었습니다.',
    });
  }

  // 사용자 정보
  @Get('/user')
  @UseGuards(AuthGuard('jwt'))
  async user(@Req() req: any, @Res() res: Response) {
    const username = req.user.username;
    const verifiedUser: User = await this.AuthService.findUser(username);

    return res.send(verifiedUser);
  }

  // 권한 확인
  @Get('/authenticate')
  @UseGuards(AuthGuard('jwt'))
  async authenticate(@Req() req: any, @Res() res: Response) {
    return res.status(200).send({
      username: req.user.username,
      message: 'authenticate',
    });
  }

  // refresh 토큰 재발급
  @Post('/refresh')
  @UseGuards(JwtRfreshGuard)
  async refresh(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
    @GetUser() user: User,
  ) {
    const newAccessToken = await this.JwtTokenService.getAccessToken(
      user.username,
    );

    res.cookie('access_token', `Bearer ${newAccessToken}`, {
      httpOnly: true,
      maxAge: 10000,
      path: '/',
    });

    res.send({
      message: 'new Access Token',
      access_token: `Bearer ${newAccessToken}`,
    });
  }
}
