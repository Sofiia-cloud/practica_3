import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import styles from '../modules/Header.module.css';
import logo from '../assets/t-bank.svg';
import profile from '../assets/Profile.svg';
import exit from '../assets/arrow-in-right.svg';

interface HeaderProps {
  onSearch?: (searchText: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchText);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    if (onSearch && value.trim()) {
      onSearch(value);
    } else if (onSearch && !value.trim()) {
      onSearch('');
    }
  };

  return (
    <nav className={styles.navigation}>
      <div className={styles.logo}>
        <button
          className={styles.profileBtn}
          onClick={() => navigate('/')}
          title="Главная"
        >
          <img src={logo} alt="Главная" className={styles.logoImage} />
        </button>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            className={styles.searchText}
            placeholder="Поиск по Т-News"
            value={searchText}
            onChange={handleSearchChange}
          />
        </form>
      </div>

      <div className={styles.menu}>
        {user ? (
          <>
            <span className={styles.userEmail}>{user.displayName}</span>
            <button
              className={styles.profileBtn}
              onClick={() => navigate('/profile')}
              title="Профиль"
            >
              <img src={profile} alt="Профиль" className={styles.profileIcon} />
            </button>

            <button
              className={styles.exitBtn}
              onClick={handleLogout}
              title="Выйти"
            >
              <img src={exit} alt="Выйти" className={styles.exitIcon} />
              Выйти
            </button>
          </>
        ) : (
          <>
            <button
              className={styles.authBtn}
              onClick={() => navigate('/login')}
            >
              <img src={exit} alt="Войти" />
              Войти
            </button>
            <button
              className={styles.authBtn}
              onClick={() => navigate('/register')}
            >
              Регистрация
            </button>
          </>
        )}
      </div>
    </nav>
  );
};
