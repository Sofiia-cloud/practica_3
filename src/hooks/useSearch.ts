import { useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Post } from '../types';

export function useSearch() {
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchPosts = async (searchText: string) => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      const postsRef = collection(db, 'posts');

      const q = query(postsRef, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);

      const results: Post[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const postText = data.text?.toLowerCase() || '';
        const userName = data.userName?.toLowerCase() || '';

        if (
          postText.includes(searchText.toLowerCase()) ||
          userName.includes(searchText.toLowerCase())
        ) {
          results.push({
            id: doc.id,
            text: data.text,
            userId: data.userId,
            userEmail: data.userEmail,
            userName: data.userName,
            userAvatar: data.userAvatar,
            createdAt: data.createdAt?.toDate() || new Date(),
            likes: data.likes || [],
            likesCount: data.likesCount || 0,
            comments: data.comments || [],
            commentsCount: data.commentsCount || 0,
          });
        }
      });

      setSearchResults(results);
    } catch (error: any) {
      setSearchError(error.message || 'Ошибка при поиске');
      console.error('Ошибка поиска:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setSearchError(null);
  };

  return {
    searchPosts,
    searchResults,
    searchLoading,
    searchError,
    clearSearch,
  };
}
