import { useState, useCallback } from 'react';
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './useAuth';

export function useLikes() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const likePost = useCallback(
    async (postId: string) => {
      if (!user) return;

      setLoading(true);
      try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          likes: arrayUnion(user.uid),
          likesCount: increment(1),
        });
      } catch (error) {
        console.error('Ошибка при лайке:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const unlikePost = useCallback(
    async (postId: string) => {
      if (!user) return;

      setLoading(true);
      try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid),
          likesCount: increment(-1),
        });
      } catch (error) {
        console.error('Ошибка при снятии лайка:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const toggleLike = useCallback(
    async (postId: string, isLiked: boolean) => {
      if (isLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
    },
    [likePost, unlikePost]
  );

  return {
    likePost,
    unlikePost,
    toggleLike,
    loading,
  };
}
