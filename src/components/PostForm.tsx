// src/components/PostForm.tsx
import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import { ProgressBar } from './ProgressBar';
import avatar from '../assets/avatar_1.svg';
import styles from '../modules/PostForm.module.css';

interface PostFormProps {
  onPostCreated?: () => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const PostForm: React.FC<PostFormProps> = ({
  onPostCreated,
  isModal = false,
  onClose,
}) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);
    return interval;
  };

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

    const progressInterval = simulateProgress();

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

      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        setText('');
        setProgress(0);
        setError(null);

        if (onPostCreated) {
          onPostCreated();
        }

        if (isModal && onClose) {
          onClose();
        } else {
          window.location.reload();
        }
      }, 500);
    } catch (error: any) {
      clearInterval(progressInterval);
      setProgress(0);
      console.error('Полная ошибка при создании поста:', error);
      setError(
        `Ошибка при публикации поста: ${error.message || 'Неизвестная ошибка'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${styles.form} ${isModal ? styles.modalForm : ''}`}
    >
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

      <div className={styles.charCount}>{text.length}/1000 символов</div>

      {loading && (
        <ProgressBar progress={progress} label="Публикация поста..." />
      )}

      <div className={styles.actions}>
        {isModal && (
          <button
            type="button"
            onClick={handleCancel}
            className={styles.cancelButton}
            disabled={loading}
          >
            Отмена
          </button>
        )}
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
