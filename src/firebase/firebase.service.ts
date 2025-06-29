import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly fbApp: admin.app.App;

  constructor() {
    // Verificar se as variáveis de ambiente estão configuradas
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (!projectId || !privateKey || !clientEmail) {
      console.warn(
        'Firebase credentials not found in environment variables. Firebase will not be initialized.',
      );
      return;
    }

    try {
      // Configurar credenciais do Firebase usando variáveis de ambiente
      const serviceAccount: ServiceAccount = {
        projectId,
        privateKey: privateKey.replace(/\\n/g, '\n'), // Converter \n para quebras de linha reais
        clientEmail,
      };

      this.fbApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw new Error('Failed to initialize Firebase');
    }
  }

  onModuleInit() {
    // You can add any module initialization logic here
    console.log('Firebase module initialized');
  }

  get auth(): admin.auth.Auth {
    if (!this.fbApp) {
      throw new Error(
        'Firebase not initialized. Check your environment variables.',
      );
    }
    return this.fbApp.auth();
  }

  get firestore(): admin.firestore.Firestore {
    if (!this.fbApp) {
      throw new Error(
        'Firebase not initialized. Check your environment variables.',
      );
    }
    return this.fbApp.firestore();
  }
}
