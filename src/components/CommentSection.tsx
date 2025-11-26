import React, { useState, useEffect } from 'react';
import { useComments } from '../hooks/useComments';
import { useAuth } from '../hooks/useAuth';
import { Comment as CommentType } from '../types';
import styles from '../modules/CommentsSection.module.css';

interface CommentSectionProps {
  postId: string;
  postAuthorId?: string;
  onClose: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  onClose,
}) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const { addComment, getComments, deleteComment, loading, error } =
    useComments();
  const { user } = useAuth();

  useEffect(() => {
    const unsubscribe = getComments(postId, (commentsData) => {
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [postId, getComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const success = await addComment(postId, newComment);
    if (success) {
      setNewComment('');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      const success = await deleteComment(commentId, postId);
      if (!success) {
        return;
      }
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'только что';
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} мин. назад`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} ч. назад`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} дн. назад`;

    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className={styles.commentSection}>
      <div className={styles.commentHeader}>
        <h3>Комментарии</h3>
        <button onClick={onClose} className={styles.closeButton}>
          ×
        </button>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.commentsList}>
        {comments.length === 0 ? (
          <div className={styles.noComments}>
            <p>Пока нет комментариев. Будьте первым!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className={styles.commentItem}>
              <div className={styles.commentHeader}>
                <img
                  src={comment.userAvatar || '/img/image.svg'}
                  alt={comment.userName}
                  className={styles.commentAvatar}
                />
                <div className={styles.commentUserInfo}>
                  <span className={styles.commentUserName}>
                    {comment.userName}
                  </span>
                  <span className={styles.commentTime}>
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                {user && user.uid === comment.userId && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className={styles.deleteCommentButton}
                    title="Удалить комментарий"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className={styles.commentText}>{comment.text}</div>
            </div>
          ))
        )}
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className={styles.commentForm}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Напишите комментарий..."
            rows={3}
            className={styles.commentInput}
            maxLength={500}
          />
          <div className={styles.commentActions}>
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className={styles.submitButton}
            >
              {loading ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.loginPrompt}>
          <p>Войдите в систему, чтобы оставлять комментарии</p>
        </div>
      )}
    </div>
  );
};
