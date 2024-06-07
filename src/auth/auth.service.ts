import { UserDto } from './dto/user.dto';
import { User } from './entity/user.entity';
import { UserRepository } from './user.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private UserRepository: UserRepository) {}

  // 회원가입
  signUp(UserDto: UserDto): Promise<void> {
    return this.UserRepository.createUser(UserDto);
  }

  // 로그인
  signin(UserDto: UserDto): Promise<{ accessToken: string }> {
    return this.UserRepository.signin(UserDto);
  }
}
