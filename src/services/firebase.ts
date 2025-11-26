import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDjFIa0gHxQce8dbop8w1s2_ghSRcKrhCo',
  authDomain: 't-news-a54bd.firebaseapp.com',
  projectId: 't-news-a54bd',
  storageBucket: 't-news-a54bd.firebasestorage.app',
  messagingSenderId: '495197011675',
  appId: '1:495197011675:web:0704e90da7712a47fa56fe',
};

const app = initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

export default app;
