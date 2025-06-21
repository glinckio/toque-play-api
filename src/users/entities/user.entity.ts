import { ProfileType } from './profile.enum';

export class User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  profiles: ProfileType[];
  emailVerified: boolean;
}
