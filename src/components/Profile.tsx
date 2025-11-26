import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { PostForm } from './PostForm';
import { AvatarSelector } from './AvatarSelector';
import edit from '../assets/edit.svg';
import cross from '../assets/Cross.svg';
import styles from '../modules/Profile.module.css';

import avatar_1 from '../assets/avatar_1.svg';
import avatar_2 from '../assets/avatar_2.svg';
import avatar_3 from '../assets/avatar_3.svg';
import avatar_4 from '../assets/avatar_4.jpg';
import { PostList } from './PostList';

export const Profile: React.FC = () => {
  const { user: currentUser } = useAuth();
  const {
    updateProfileData,

    loading,
    error,
  } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
  });
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [postsCount, setPostsCount] = useState(0);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  const avatarMap: { [key: string]: string } = {
    avatar_1,
    avatar_2,
    avatar_3,
    avatar_4,
  };

  useEffect(() => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || '',
        bio: currentUser.bio || '',
      });

      if (currentUser.photoURL) {
        setImagePreview(currentUser.photoURL);

        const currentAvatar = Object.keys(avatarMap).find(
          (key) => avatarMap[key] === currentUser.photoURL
        );
        setSelectedAvatar(currentAvatar || null);
      } else {
        setImagePreview(null);
        setSelectedAvatar(null);
      }
    }
  }, [currentUser]);

  const updatePostsCount = (count: number) => {
    setPostsCount(count);
  };

  const handleAvatarSelect = (type: 'image', value: string | null) => {
    if (type === 'image') {
      setSelectedAvatar(value);
      if (value && avatarMap[value]) {
        setImagePreview(avatarMap[value]);
      } else {
        setImagePreview(null);
      }
      setShowAvatarSelector(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    const success = await updateProfileData({
      displayName: formData.displayName.trim(),
      bio: formData.bio.trim(),
      photoURL: selectedAvatar ? avatarMap[selectedAvatar] : '',
    });

    if (success) {
      setIsEditing(false);
      setSelectedAvatar(null);
      setShowAvatarSelector(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedAvatar(null);
    setShowAvatarSelector(false);

    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || '',
        bio: currentUser.bio || '',
      });
      setImagePreview(currentUser.photoURL || null);

      if (currentUser.photoURL) {
        const currentAvatar = Object.keys(avatarMap).find(
          (key) => avatarMap[key] === currentUser.photoURL
        );
        setSelectedAvatar(currentAvatar || null);
      } else {
        setSelectedAvatar(null);
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!currentUser) {
    return <div className={styles.loading}>Пользователь не найден</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <section className={styles.personInfo}>
        <div className={styles.profileImage}>
          <div className={styles.imageContainer}>
            <img
              src={imagePreview || avatar_1}
              alt="Изображение профиля"
              className={styles.profileImage}
            />
          </div>

          {isEditing && (
            <button
              className={styles.changeImageButton}
              onClick={() => setShowAvatarSelector(true)}
              type="button"
            >
              Изменить фото
            </button>
          )}
        </div>

        {isEditing && showAvatarSelector && (
          <AvatarSelector
            avatarImage={selectedAvatar}
            onSelect={handleAvatarSelect}
          />
        )}

        <div className={styles.profileInfo}>
          <div className={styles.profileInfoHeader}>
            {isEditing ? (
              <input
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="Введите ваше имя"
                className={styles.nameInput}
                maxLength={50}
              />
            ) : (
              <h1>{currentUser.displayName || 'Пользователь'}</h1>
            )}

            <button
              className={styles.editButton}
              onClick={() => setIsEditing(!isEditing)}
              title={isEditing ? 'Отменить' : 'Редактировать'}
            >
              <img
                src={isEditing ? cross : edit}
                alt={isEditing ? 'Отменить' : 'Редактировать'}
              />
            </button>
          </div>

          <div className={styles.profileInfoBody}>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className={styles.bioTextarea}
                rows={4}
                maxLength={500}
              />
            ) : (
              <p>
                {currentUser.bio ||
                  'Пользователь еще не добавил информацию о себе.'}
              </p>
            )}
          </div>

          {isEditing && (
            <div className={styles.editControls}>
              <button
                onClick={handleSave}
                disabled={loading}
                className={styles.saveButton}
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button onClick={handleCancel} className={styles.cancelButton}>
                Отмена
              </button>
            </div>
          )}

          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>
              Количество публикаций: {postsCount}
            </span>
          </div>
        </div>
      </section>

      <PostForm />

      <PostList
        onPostsCountChange={updatePostsCount}
        showOnlyUserPosts={true}
        targetUserId={currentUser.uid}
      />
    </div>
  );
};
