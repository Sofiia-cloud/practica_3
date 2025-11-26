import React from 'react';
import styles from '../modules/AvatarSelector.module.css';
import avatar_1 from '../assets/avatar_1.svg';
import avatar_2 from '../assets/avatar_2.svg';
import avatar_3 from '../assets/avatar_3.svg';
import avatar_4 from '../assets/avatar_4.jpg';

type AvatarSelectorType = {
  avatarImage: string | null;
  onSelect: (type: 'image', value: string | null) => void;
};

export const AvatarSelector: React.FC<AvatarSelectorType> = ({
  avatarImage,
  onSelect,
}) => {
  const profileImages = [
    { id: 'avatar_1', src: avatar_1 },
    { id: 'avatar_2', src: avatar_2 },
    { id: 'avatar_3', src: avatar_3 },
    { id: 'avatar_4', src: avatar_4 },
  ];

  return (
    <div className={styles.avatarSelector}>
      <h4 className={styles.title}>Выберите аватар</h4>
      <div className={styles.avatarGrid}>
        {profileImages.map((img) => (
          <div
            key={img.id}
            className={`${styles.avatarItem} ${
              avatarImage === img.id ? styles.selected : ''
            }`}
            onClick={() => onSelect('image', img.id)}
          >
            <img src={img.src} alt={img.id} className={styles.avatarImage} />
          </div>
        ))}
      </div>
    </div>
  );
};
