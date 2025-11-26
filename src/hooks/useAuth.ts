import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  UserCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let userData: Partial<User> = {};

        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            userData = userDoc.data();
          }
        } catch (error) {
          console.error('Ошибка при загрузке данных пользователя:', error);
        }
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || userData.displayName,
          photoURL: firebaseUser.photoURL || userData.photoURL,
          bio: userData.bio,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<UserCredential> => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (credentials: {
    email: string;
    password: string;
    displayName?: string;
  }): Promise<UserCredential> => {
    const { email, password, displayName } = credentials;
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    if (displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName });

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        displayName,
        bio: '',
      });
    }
    return userCredential;
  };

  const logout = (): Promise<void> => {
    return signOut(auth);
  };

  return { user, login, register, logout, loading };
}
