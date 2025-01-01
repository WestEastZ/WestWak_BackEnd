import { JwtTokenService } from './token/jwt.service';
import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Get,
  Logger,
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
  constructor(private AuthService: AuthService) {}

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
    const response = await this.AuthService.signin(UserDto, res);

    return {
      id: response.id,
      username: response.username,
      access_token: response.accessToken,
      refresh_token: response.refreshToken,
      message: response.message,
    };
  }

  // 로그아웃
  @Post('/logout')
  async logout(@Res({ passthrough: true }) res: Response): Promise<any> {
    await this.AuthService.logout(res);

    return {
      message: '로그아웃 되었습니다.',
    };
  }

  // 사용자 정보
  @Get('/user')
  @UseGuards(AuthGuard('jwt'))
  async user(@Req() req: any, @Res() res: Response) {
    const user = req.user;

    const verifiedUser: User = await this.AuthService.findUser(user);

    return res.send(verifiedUser);
  }

  // 권한 확인
  @Get('/authenticate')
  @UseGuards(AuthGuard('jwt'))
  async authenticate(@Req() req: any, @Res() res: Response) {
    return res.status(200).send({
      username: req.user.username,
      userId: req.user.id,
      provider: req.user.provider,
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
    const result = await this.AuthService.getNewAccessToken(user, res);

    res.send({
      message: result.message,
      access_token: result.access_token,
    });
  }

  // 카카오 로그인
  @Post('/kakao')
  async kakakoCallback(
    @Body('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await this.AuthService.kakaoLogin(code, res);
    return {
      id: response.id,
      username: response.username,
      access_token: response.accessToken,
      refresh_token: response.refreshToken,
      message: response.message,
    };
  }

  // 구글 로그인
  @Post('/google')
  async googleCallback(
    @Body('code') code: string,
    @Res({ passthrough: true }) res: Response,
    @GetUser() user: User,
  ) {
    const response = await this.AuthService.googleLogin(code, res);

    return {
      id: response.id,
      username: response.username,
      access_token: response.accessToken,
      refresh_token: response.refreshToken,
      provider: response.provider,
      message: response.message,
    };
  }

  @Post('/github')
  async githubCallback(
    @Body('code') code: string,
    @Res({ passthrough: true }) res: Response,
    @GetUser() user: User,
  ) {
    const response = await this.AuthService.githubLogin(code, res);

    return {
      id: response.id,
      username: response.username,
      access_token: response.accessToken,
      refresh_token: response.refreshToken,
      provider: response.provider,
      message: response.message,
    };
  }
}
