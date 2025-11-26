import React from 'react';
import styles from '../modules/ProgressBar.module.css';

interface ProgressBarProps {
  progress: number; // от 0 до 100
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label = 'Загрузка...',
}) => {
  return (
    <div className={styles.progressContainer}>
      {label && <span className={styles.progressLabel}>{label}</span>}
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <span className={styles.progressPercentage}>{Math.round(progress)}%</span>
    </div>
  );
};
