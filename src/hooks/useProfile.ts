import { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  getDocs,
  collection,
  query,
  where,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { auth, db, storage } from '../services/firebase';
import { User } from '../types';

interface UpdateProfileData {
  displayName?: string;
  bio?: string;
  photoURL?: string;
}

export function useProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribeToUser = async (
    subscriberId: string,
    targetUserId: string
  ) => {
    try {
      const subscriptionRef = collection(db, 'subscriptions');
      await addDoc(subscriptionRef, {
        subscriberId,
        targetUserId,
        createdAt: new Date(),
      });
      const userRef = doc(db, 'users', targetUserId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const currentSubscribers = userDoc.data().subscribersCount || 0;
        await setDoc(
          userRef,
          { subscribersCount: currentSubscribers + 1 },
          { merge: true }
        );
      }

      return true;
    } catch (err: any) {
      setError(err.message || 'Ошибка при подписке');
      return false;
    }
  };

  const unsubscribeFromUser = async (
    subscriberId: string,
    targetUserId: string
  ) => {
    try {
      const subscriptionRef = collection(db, 'subscriptions');
      const q = query(
        subscriptionRef,
        where('subscriberId', '==', subscriberId),
        where('targetUserId', '==', targetUserId)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (document) => {
        await deleteDoc(doc(db, 'subscriptions', document.id));
      });

      const userRef = doc(db, 'users', targetUserId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const currentSubscribers = userDoc.data().subscribersCount || 0;
        await setDoc(
          userRef,
          { subscribersCount: Math.max(0, currentSubscribers - 1) },
          { merge: true }
        );
      }

      return true;
    } catch (err: any) {
      setError(err.message || 'Ошибка при отписке');
      return false;
    }
  };

  const checkIfSubscribed = async (
    subscriberId: string,
    targetUserId: string
  ): Promise<boolean> => {
    try {
      const subscriptionRef = collection(db, 'subscriptions');
      const q = query(
        subscriptionRef,
        where('subscriberId', '==', subscriberId),
        where('targetUserId', '==', targetUserId)
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (err: any) {
      console.error('Ошибка проверки подписки:', err);
      return false;
    }
  };

  const updateUserProfile = async (userId: string, data: UpdateProfileData) => {
    setLoading(true);
    setError(null);

    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, data, { merge: true });
      return true;
    } catch (err: any) {
      setError(err.message || 'Ошибка при обновлении профиля');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadProfileImage = async (
    file: File,
    userId: string
  ): Promise<string | null> => {
    try {
      const user = auth.currentUser;
      if (user?.photoURL) {
        try {
          const oldImageRef = ref(storage, user.photoURL);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.log('Старое изображение не найдено или уже удалено');
        }
      }

      const storageRef = ref(
        storage,
        `profile-images/${userId}/${Date.now()}_${file.name}`
      );
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке изображения');
      return null;
    }
  };

  const updateProfileData = async (data: {
    displayName?: string;
    bio?: string;
    photoFile?: File;
    photoURL?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Пользователь не авторизован');

      const updates: UpdateProfileData = {};
      let photoURL: string | null = null;

      if (data.photoURL !== undefined) {
        photoURL = data.photoURL;
        if (photoURL) {
          updates.photoURL = photoURL;
        } else {
          updates.photoURL = '';
        }
      } else if (data.photoFile) {
        photoURL = await uploadProfileImage(data.photoFile, user.uid);
        if (photoURL) {
          updates.photoURL = photoURL;
        }
      }

      if (data.displayName && data.displayName !== user.displayName) {
        updates.displayName = data.displayName;
      }

      if (data.bio !== undefined) {
        updates.bio = data.bio;
      }

      if (updates.displayName || updates.photoURL !== undefined) {
        await updateProfile(user, {
          displayName: updates.displayName || user.displayName,
          photoURL:
            updates.photoURL !== undefined ? updates.photoURL : user.photoURL,
        });
      }

      await updateUserProfile(user.uid, updates);
      window.location.reload();
      return true;
    } catch (err: any) {
      setError(err.message || 'Ошибка при обновлении профиля');
      return false;
    } finally {
      setLoading(false);
    }
  };
  const getUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке профиля');
      return null;
    }
  };

  return {
    updateProfileData,
    getUserProfile,
    uploadProfileImage,
    subscribeToUser,
    unsubscribeFromUser,
    checkIfSubscribed,
    loading,
    error,
    clearError: () => setError(null),
  };
}
