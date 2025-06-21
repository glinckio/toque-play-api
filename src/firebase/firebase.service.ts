import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly fbApp: admin.app.App;

  constructor() {
    const serviceAccountPath = path.join(
      process.cwd(),
      'firebase-service-account.json',
    );
    const serviceAccountContent = fs
      .readFileSync(serviceAccountPath)
      .toString();

    if (!serviceAccountContent) {
      throw new Error('Firebase service account file not found or is empty.');
    }

    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountContent);

    this.fbApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  onModuleInit() {
    // You can add any module initialization logic here
    console.log('Firebase module initialized');
  }

  get auth(): admin.auth.Auth {
    return this.fbApp.auth();
  }

  get firestore(): admin.firestore.Firestore {
    return this.fbApp.firestore();
  }
}
