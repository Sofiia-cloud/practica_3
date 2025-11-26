import React, { useState } from 'react';
import { Post } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useLikes } from '../hooks/useLikes';
import { CommentSection } from './CommentSection';
import comment_icon from '../assets/comment.svg';
import styles from '../modules/PostList.module.css';

interface SearchResultsProps {
  posts: Post[];
  searchQuery: string;
  onClearSearch: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  posts,
  searchQuery,
  onClearSearch,
}) => {
  const { user } = useAuth();
  const { toggleLike, loading: likeLoading } = useLikes();
  const [showCommentsForPost, setShowCommentsForPost] = useState<string | null>(
    null
  );

  const handleLikeClick = async (post: Post) => {
    if (!user) {
      alert('Войдите в систему чтобы ставить лайки');
      return;
    }

    try {
      const isLiked = post.likes.includes(user.uid);
      await toggleLike(post.id, isLiked);
    } catch (error) {
      console.error('Ошибка при лайке:', error);
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

  if (posts.length === 0 && searchQuery) {
    return (
      <div className={styles.searchResults}>
        <div className={styles.searchHeader}>
          <h3>Результаты поиска для: "{searchQuery}"</h3>
          <button onClick={onClearSearch} className={styles.clearSearchButton}>
            ×
          </button>
        </div>
        <div className={styles.noResults}>
          <p>По вашему запросу ничего не найдено</p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className={styles.searchResults}>
      <div className={styles.searchHeader}>
        <h3>Результаты поиска для: "{searchQuery}"</h3>
        <button onClick={onClearSearch} className={styles.clearSearchButton}>
          ×
        </button>
      </div>

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
                    <span className={styles.likesCount}>{post.likesCount}</span>
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
                    onClose={() => setShowCommentsForPost(null)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
