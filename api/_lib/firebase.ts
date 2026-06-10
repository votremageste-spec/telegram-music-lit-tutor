import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!initializeApp.length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const db = getFirestore();

export const usersCollection = db.collection('users');
export const progressCollection = db.collection('progress');
export const testResultsCollection = db.collection('test_results');
export const audioResultsCollection = db.collection('audio_results');
export const chatHistoryCollection = db.collection('chat_history');
