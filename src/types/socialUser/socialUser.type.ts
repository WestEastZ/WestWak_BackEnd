import { AuthProvider } from '../enum/auth.enum';

export interface SocialUserData {
  socialId: string;
  username: string;
  provider: AuthProvider;
}
