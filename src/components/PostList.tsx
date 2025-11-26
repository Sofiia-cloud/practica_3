import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { Post as PostType } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useLikes } from '../hooks/useLikes';
import { CommentSection } from './CommentSection';
import delete_icon from '../assets/delete.svg';
import comment_icon from '../assets/comment.svg';
import styles from '../modules/PostList.module.css';

interface PostListProps {
  onPostsCountChange?: (count: number) => void;
  showOnlyUserPosts?: boolean;
  targetUserId?: string;
}

export const PostList: React.FC<PostListProps> = ({
  onPostsCountChange,
  showOnlyUserPosts = false,
  targetUserId,
}) => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [showCommentsForPost, setShowCommentsForPost] = useState<string | null>(
    null
  );
  const { user } = useAuth();
  const { toggleLike, loading: likeLoading } = useLikes();

  useEffect(() => {
    let q;
    const userIdToShow = targetUserId || user?.uid;
    if (showOnlyUserPosts && userIdToShow) {
      q = query(
        collection(db, 'posts'),
        where('userId', '==', userIdToShow),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData: PostType[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        postsData.push({
          id: doc.id,
          text: data.text,
          userId: data.userId,
          userEmail: data.userEmail,
          userName: data.userName,
          userAvatar: data.userAvatar,
          createdAt: data.createdAt?.toDate() || new Date(),
          likes: data.likes || [],
          likesCount: data.likesCount || 0,
          comments: [],
          commentsCount: data.commentsCount || 0,
        });
      });
      setPosts(postsData);
      setLoading(false);

      if (onPostsCountChange) {
        onPostsCountChange(postsData.length);
      }
    });

    return () => unsubscribe();
  }, [user, onPostsCountChange, showOnlyUserPosts, targetUserId]);

  const handleLikeClick = async (post: PostType) => {
    if (!user) {
      alert('Войдите в систему чтобы ставить лайки');
      return;
    }

    if (user.uid === post.userId) {
      alert('Нельзя лайкать свои посты');
      return;
    }

    try {
      const isLiked = post.likes.includes(user.uid);
      await toggleLike(post.id, isLiked);
    } catch (error) {
      console.error('Ошибка при лайке:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) return;

    if (!window.confirm('Вы уверены, что хотите удалить этот пост?')) {
      return;
    }

    setDeletingPostId(postId);
    try {
      await deleteDoc(doc(db, 'posts', postId));
      console.log('Пост успешно удален');
      window.location.reload();
    } catch (error) {
      console.error('Ошибка при удалении поста:', error);
      alert('Не удалось удалить пост');
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleCommentClick = (postId: string) => {
    setShowCommentsForPost(showCommentsForPost === postId ? null : postId);
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
    <div className={styles.postsContainer}>
      <h2 className={styles.title}>
        {' '}
        {showOnlyUserPosts ? 'Мои публикации' : 'Все публикации'}
      </h2>

      {posts.length === 0 ? (
        <div className={styles.emptyState}>
          <p>У вас пока нет публикаций. Создайте первую!</p>
        </div>
      ) : (
        <div className={styles.postsList}>
          {posts.map((post) => {
            const isLiked = user ? post.likes.includes(user.uid) : false;
            const isOwnPost = user ? user.uid === post.userId : false;

            return (
              <div key={post.id} className={styles.publication}>
                <div className={styles.publicationContent}>
                  <div className={styles.publicationHeader}>
                    <div className={styles.userInfo}>
                      <img
                        src={post.userAvatar || '/img/image.svg'}
                        alt={post.userName}
                        className={styles.publicationPersonImage}
                      />
                      <div className={styles.userDetails}>
                        <p className={styles.name}>{post.userName}</p>
                        <span className={styles.time}>
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                    </div>
                    {isOwnPost && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletingPostId === post.id}
                        className={styles.deleteButton}
                        title="Удалить пост"
                      >
                        {deletingPostId === post.id ? (
                          <span className={styles.deletingText}>...</span>
                        ) : (
                          <img src={delete_icon} alt={'Удалить'} />
                        )}
                      </button>
                    )}
                  </div>

                  <div className={styles.publicationBody}>
                    <p className={styles.publicationText}>{post.text}</p>
                  </div>

                  <div className={styles.publicationFooter}>
                    <button
                      onClick={() => handleLikeClick(post)}
                      disabled={likeLoading || isOwnPost}
                      className={`${styles.likesButton} ${isLiked ? styles.liked : ''} ${isOwnPost ? styles.disabled : ''}`}
                      title={
                        isOwnPost
                          ? 'Нельзя лайкать свои посты'
                          : isLiked
                            ? 'Убрать лайк'
                            : 'Поставить лайк'
                      }
                    >
                      <svg
                        className={styles.likeIcon}
                        viewBox="0 0 24 24"
                        fill={isLiked ? 'currentColor' : 'none'}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span className={styles.likesCount}>
                        {post.likesCount}
                      </span>
                    </button>

                    <button
                      onClick={() => handleCommentClick(post.id)}
                      className={styles.greyButton}
                    >
                      <img
                        src={comment_icon}
                        alt="Комментарии"
                        className={styles.commentIcon}
                      />
                      Комментарии
                      <span className={styles.commentsCount}>
                        {post.commentsCount || 0}
                      </span>
                    </button>
                  </div>

                  {showCommentsForPost === post.id && (
                    <CommentSection
                      postId={post.id}
                      postAuthorId={post.userId}
                      onClose={() => setShowCommentsForPost(null)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
