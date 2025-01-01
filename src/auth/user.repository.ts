import { UserDto } from './dto/user.dto';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entity/user.entity';
import * as bcrypt from 'bcryptjs';
import { AuthProvider } from 'src/types/enum/auth.enum';
import { SocialUserData } from 'src/types/socialUser/socialUser.type';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  // 회원가입
  async createUser(
    UserDto: UserDto,
  ): Promise<{ username: string; message: string }> {
    const { username, password } = UserDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.create({
      username,
      password: hashedPassword,
      provider: AuthProvider.LOCAL,
    });

    try {
      await this.save(user);
      return { username, message: '회원가입 되었습니다.' };
    } catch (error) {
      if (error.errno === 1062) {
        throw new ConflictException({
          type: 'username',
          message: '이미 사용중인 사용자 이름입니다.',
        });
      } else {
        throw new InternalServerErrorException({
          type: 'server',
          message: '서버 오류가 발생했습니다.',
        });
      }
    }
  }

  // 소셜 회원가입
  async findOrCreateSocialUser(userData: SocialUserData) {
    try {
      let user = await this.findOne({
        where: {
          username: userData.username,
          provider: userData.provider,
        },
      });

      if (!user) {
        const dummyPassword = 'SOCIAL_LOGIN_USER';

        user = this.create({
          username: userData.username,
          provider: userData.provider,
          password: dummyPassword,
        });

        await this.save(user);
      }

      return user;
    } catch (error) {
      throw new InternalServerErrorException({
        type: 'server',
        message: '서버 오류가 발생했습니다.',
      });
    }
  }
}
