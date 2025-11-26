import { useState } from 'react';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  runTransaction,
} from 'firebase/firestore';
import avatar from '../assets/avatar_1.svg';
import { db } from '../services/firebase';
import { useAuth } from './useAuth';
import { Comment } from '../types';

export function useComments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const addComment = async (postId: string, text: string) => {
    if (!user) {
      setError('Пользователь не авторизован');
      return null;
    }

    if (!text.trim()) {
      setError('Введите текст комментария');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const commentData = {
        text: text.trim(),
        userId: user.uid,
        userEmail: user.email || '',
        userName:
          user.displayName || user.email?.split('@')[0] || 'Пользователь',
        userAvatar: user.photoURL || avatar,
        postId: postId,
        createdAt: serverTimestamp(),
      };

      const commentRef = await addDoc(collection(db, 'comments'), commentData);

      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        commentsCount: increment(1),
      });

      return commentRef.id;
    } catch (err: any) {
      setError(err.message || 'Ошибка при добавлении комментария');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getComments = (
    postId: string,
    callback: (comments: Comment[]) => void
  ) => {
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const commentsData: Comment[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          commentsData.push({
            id: doc.id,
            text: data.text,
            userId: data.userId,
            userEmail: data.userEmail,
            userName: data.userName,
            userAvatar: data.userAvatar || '/img/image.svg',
            postId: data.postId,
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        });
        callback(commentsData);
      },
      (error) => {
        console.error('Ошибка загрузки комментариев:', error);
        setError('Ошибка загрузки комментариев');
        callback([]);
      }
    );
  };

  const deleteComment = async (commentId: string, postId: string) => {
    if (!user) {
      setError('Пользователь не авторизован');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await runTransaction(db, async (transaction) => {
        const commentRef = doc(db, 'comments', commentId);
        const commentDoc = await transaction.get(commentRef);

        if (!commentDoc.exists()) {
          throw new Error('Комментарий не найден');
        }

        const commentData = commentDoc.data();

        if (commentData.userId !== user.uid) {
          const postRef = doc(db, 'posts', postId);
          const postDoc = await transaction.get(postRef);

          if (!postDoc.exists()) {
            throw new Error('Пост не найден');
          }

          const postData = postDoc.data();
          if (postData.userId !== user.uid) {
            throw new Error('Недостаточно прав для удаления комментария');
          }
        }

        transaction.delete(commentRef);

        const postRef = doc(db, 'posts', postId);
        transaction.update(postRef, {
          commentsCount: increment(-1),
        });
        window.location.reload();
      });

      return true;
    } catch (err: any) {
      console.error('Ошибка при удалении комментария:', err);
      setError(err.message || 'Ошибка при удалении комментария');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    addComment,
    getComments,
    deleteComment,
    loading,
    error,
    clearError: () => setError(null),
  };
}
