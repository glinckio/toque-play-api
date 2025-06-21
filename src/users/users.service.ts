import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { User } from './entities/user.entity';
import { ProfileType } from './entities/profile.enum';

@Injectable()
export class UsersService {
  private readonly firestore;
  constructor(private readonly firebaseService: FirebaseService) {
    this.firestore = this.firebaseService.firestore;
  }

  async create(user: Omit<User, 'profiles' | 'emailVerified'>): Promise<User> {
    const newUser: User = {
      ...user,
      profiles: [],
      emailVerified: false,
    };

    await this.firestore.collection('users').doc(user.uid).set(newUser);
    return newUser;
  }

  async findByUid(uid: string): Promise<User | null> {
    const userDoc = await this.firestore.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return null;
    }
    return userDoc.data() as User;
  }

  async updateProfiles(uid: string, profiles: ProfileType[]): Promise<User> {
    const userRef = this.firestore.collection('users').doc(uid);
    await userRef.update({ profiles });

    const updatedUserDoc = await userRef.get();
    return updatedUserDoc.data() as User;
  }
}
