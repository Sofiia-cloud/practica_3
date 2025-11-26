import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useSearch } from './hooks/useSearch';
import { Header } from './components/Header';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { Profile } from './components/Profile';
import { PostList } from './components/PostList';
import { SearchResults } from './components/SearchText';
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
      <div className="App">
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
