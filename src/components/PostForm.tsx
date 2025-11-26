import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import avatar from '../assets/avatar_1.svg';
import styles from '../modules/PostForm.module.css';

export const PostForm: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('Пользователь не авторизован');
      return;
    }

    if (!text.trim()) {
      setError('Введите текст поста');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addDoc(collection(db, 'posts'), {
        text: text.trim(),
        userId: user.uid,
        userEmail: user.email,
        userName:
          user.displayName || user.email?.split('@')[0] || 'Пользователь',
        userAvatar: user.photoURL || avatar,
        createdAt: serverTimestamp(),
        likes: [],
        likesCount: 0,
        comments: [],
      });

      setText('');
      setError(null);
      window.location.reload();

      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      console.error('Полная ошибка при создании поста:', error);
      setError(
        `Ошибка при публикации поста: ${error.message || 'Неизвестная ошибка'}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Создать публикацию</h2>

      {error && (
        <div className={styles.errorMessage}>
          {error}
          <button
            type="button"
            onClick={() => setError(null)}
            className={styles.closeError}
          >
            ×
          </button>
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Что у вас нового?"
        rows={3}
        className={styles.textarea}
        maxLength={1000}
      />

      <div className={styles.actions}>
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className={styles.submitButton}
        >
          {loading ? 'Публикация...' : 'Опубликовать'}
        </button>
      </div>
    </form>
  );
};
