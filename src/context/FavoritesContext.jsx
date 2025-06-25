import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
    const { user } = useAuth();
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchFavorites();
        } else {
            setFavoriteIds(new Set());
            setFavorites([]);
            setLoading(false);
        }
    }, [user]);

    const fetchFavorites = async () => {
        try {
            const response = await axios.get(`http://localhost:5002/api/users/${user.id}/favorites`);
            const favoritesData = response.data;
            setFavorites(favoritesData);
            setFavoriteIds(new Set(favoritesData.map(fav => fav.clip_id)));
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch favorites:', error);
            setLoading(false);
        }
    };

    const addToFavorites = async (clipId, title) => {
        if (!user) return;

        try {
            await axios.post(`http://localhost:5002/api/users/${user.id}/favorites`, { clipId, title });
            setFavoriteIds(prev => new Set([...prev, clipId]));
            await fetchFavorites();
        } catch (error) {
            console.error('Failed to add to favorites:', error);
            setFavoriteIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(clipId);
                return newSet;
            });
        }
    };

    const removeFromFavorites = async (clipId) => {
        if (!user) return;

        try {
            await axios.delete(`http://localhost:5002/api/users/${user.id}/favorites/${clipId}`);
            // 로컬 상태 즉시 업데이트
            setFavoriteIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(clipId);
                return newSet;
            });
            // 전체 데이터 새로고침
            await fetchFavorites();
        } catch (error) {
            console.error('Failed to remove from favorites:', error);
            // 실패 시 로컬 상태 롤백
            setFavoriteIds(prev => new Set([...prev, clipId]));
        }
    };

    const isFavorite = (clipId) => {
        return favoriteIds.has(clipId);
    };

    return (
        <FavoritesContext.Provider value={{
            favorites,
            loading,
            addToFavorites,
            removeFromFavorites,
            isFavorite
        }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
} 