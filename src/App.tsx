import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useSearch } from './hooks/useSearch';
import { Header } from './components/Header';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { Profile } from './components/Profile';
import { PostList } from './components/PostList';
import { SearchResults } from './components/SearchText';
import { TechnologiesPage } from './components/TechnologiesPage';
import './App.css';

function App() {
  const { user, loading } = useAuth();
  const {
    searchPosts,
    searchResults,
    searchLoading,
    searchError,
    clearSearch,
  } = useSearch();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Управление темой
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleSearch = (searchText: string) => {
    if (searchText.trim()) {
      setSearchQuery(searchText);
      setIsSearching(true);
      searchPosts(searchText);
    } else {
      clearSearch();
      setIsSearching(false);
      setSearchQuery('');
    }
  };

  const handleClearSearch = () => {
    clearSearch();
    setIsSearching(false);
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="App">
        <div className="main-container">
          <div className="loading-screen">
            <div className="loading-spinner"></div>
            <p>Загрузка приложения...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className={`App ${darkMode ? 'dark-theme' : ''}`}>
        {/* Кнопка переключения темы */}
        <button
          onClick={toggleTheme}
          className="theme-toggle"
          title={
            darkMode
              ? 'Переключить на светлую тему'
              : 'Переключить на темную тему'
          }
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            background: darkMode ? '#333' : '#fff',
            border: `2px solid ${darkMode ? '#ffd700' : '#333'}`,
            color: darkMode ? '#fff' : '#333',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        <div className="main-container">
          <Header onSearch={handleSearch} />
          <main className="main-content">
            <div className="container">
              {/* Режим поиска */}
              {isSearching && (
                <div className="search-mode">
                  {searchLoading && (
                    <div className="loading-indicator">
                      <div className="loading-spinner"></div>
                      <p>Поиск публикаций...</p>
                    </div>
                  )}

                  {searchError && (
                    <div className="error-message">
                      <span>⚠️</span>
                      {searchError}
                    </div>
                  )}

                  {!searchLoading && !searchError && (
                    <SearchResults
                      posts={searchResults}
                      searchQuery={searchQuery}
                      onClearSearch={handleClearSearch}
                    />
                  )}
                </div>
              )}

              {/* Обычный режим (не поиск) */}
              {!isSearching && (
                <Routes>
                  {/* Логин - если пользователь не авторизован, показываем форму входа */}
                  <Route
                    path="/login"
                    element={
                      !user ? (
                        <LoginForm />
                      ) : (
                        <PostList showOnlyUserPosts={false} />
                      )
                    }
                  />

                  {/* Регистрация - если пользователь не авторизован, показываем форму регистрации */}
                  <Route
                    path="/register"
                    element={
                      !user ? (
                        <RegisterForm />
                      ) : (
                        <PostList showOnlyUserPosts={false} />
                      )
                    }
                  />

                  {/* Профиль - только для авторизованных пользователей */}
                  <Route
                    path="/profile"
                    element={user ? <Profile /> : <LoginForm />}
                  />

                  {/* Технологии */}
                  <Route
                    path="/technologies"
                    element={user ? <TechnologiesPage /> : <LoginForm />}
                  />

                  {/* Главная страница */}
                  <Route
                    path="/"
                    element={
                      user ? (
                        <div className="home-page">
                          <PostList showOnlyUserPosts={false} />
                        </div>
                      ) : (
                        <div className="auth-page">
                          <LoginForm />
                        </div>
                      )
                    }
                  />

                  {/* Резервный маршрут для несуществующих страниц */}
                  <Route
                    path="*"
                    element={
                      <div className="not-found">
                        <h2>Страница не найдена</h2>
                        <p>Запрашиваемая страница не существует.</p>
                        {user ? (
                          <a href="/" className="back-link">
                            Вернуться на главную
                          </a>
                        ) : (
                          <a href="/login" className="back-link">
                            Войти в систему
                          </a>
                        )}
                      </div>
                    }
                  />
                </Routes>
              )}
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
