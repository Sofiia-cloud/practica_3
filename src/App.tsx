import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useSearch } from './hooks/useSearch';
import { Header } from './components/Header';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { Profile } from './components/Profile';
import { PostForm } from './components/PostForm';
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
    return <div className="App">Загрузка...</div>;
  }

  return (
    <Router>
      <div className="App">
        <div className="main-container">
          <Header onSearch={handleSearch} />
          <main className="main-content">
            <div className="container">
              {isSearching && (
                <SearchResults
                  posts={searchResults}
                  searchQuery={searchQuery}
                  onClearSearch={handleClearSearch}
                />
              )}

              {searchLoading && <div className="loading">Поиск...</div>}

              {searchError && (
                <div className="error-message">{searchError}</div>
              )}

              {!isSearching && (
                <Routes>
                  <Route
                    path="/login"
                    element={!user ? <LoginForm /> : <PostList />}
                  />
                  <Route
                    path="/register"
                    element={!user ? <RegisterForm /> : <PostList />}
                  />
                  <Route
                    path="/profile"
                    element={user ? <Profile /> : <LoginForm />}
                  />
                  <Route
                    path="/"
                    element={
                      user ? (
                        <div className="fade-in">
                          <PostList showOnlyUserPosts={false} />
                          <PostForm />
                        </div>
                      ) : (
                        <LoginForm />
                      )
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
