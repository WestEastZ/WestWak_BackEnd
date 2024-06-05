import { UserDto } from './user.dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private UserRepository: UserRepository) {}
  signUp(UserDto: UserDto): Promise<void> {
    return this.UserRepository.createUser(UserDto);
  }
}
