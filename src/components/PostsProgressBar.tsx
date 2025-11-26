// src/components/PostsProgressBar.tsx
import React from 'react';
import { ProgressBar } from './ProgressBar';
import styles from '../modules/PostsProgressBar.module.css';

interface PostsProgressBarProps {
  currentPosts: number;
  totalPosts: number;
  goalPosts?: number;
}

export const PostsProgressBar: React.FC<PostsProgressBarProps> = ({
  currentPosts,
  totalPosts,
  goalPosts = 100, // цель по умолчанию
}) => {
  const progress = Math.min(100, (currentPosts / goalPosts) * 100);

  const getProgressLabel = () => {
    if (currentPosts === 0) return 'Начните создавать посты!';
    if (currentPosts < 10) return 'Отличное начало!';
    if (currentPosts < 50) return 'Продолжайте в том же духе!';
    return 'Отличная активность!';
  };

  return (
    <div className={styles.postsProgressContainer}>
      <div className={styles.progressHeader}>
        <h3 className={styles.title}>Прогресс публикаций</h3>
        <div className={styles.stats}>
          <span className={styles.currentCount}>{currentPosts}</span>
          <span className={styles.separator}>/</span>
          <span className={styles.goalCount}>{goalPosts} постов</span>
        </div>
      </div>

      <ProgressBar progress={progress} label={getProgressLabel()} />

      <div className={styles.progressInfo}>
        <div className={styles.milestones}>
          <div className={styles.milestone}>
            <span className={styles.milestoneDot}></span>
            <span>10 постов</span>
          </div>
          <div className={styles.milestone}>
            <span className={styles.milestoneDot}></span>
            <span>50 постов</span>
          </div>
          <div className={styles.milestone}>
            <span className={styles.milestoneDot}></span>
            <span>100 постов</span>
          </div>
        </div>
      </div>
    </div>
  );
};
