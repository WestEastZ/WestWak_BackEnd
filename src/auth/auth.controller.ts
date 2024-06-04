import { AuthService } from './auth.service';
import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { UserDto } from './user.dto';

@Controller('auth')
export class AuthController {
  constructor(private AuthService: AuthService) {}

  @Post('/signup')
  signup(@Body(ValidationPipe) UserDto: UserDto): Promise<void> {
    return this.AuthService.signUp(UserDto);
  }
}
