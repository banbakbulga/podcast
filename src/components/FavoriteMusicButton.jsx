import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

function FavoriteMusicButton({ clip, variant }) {
    const { user } = useAuth();
    const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();

    const handleFavoriteClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return;
        try {
            if (isFavorite(clip.id)) {
                await removeFromFavorites(clip.id);
            } else {
                await addToFavorites(clip.id, clip.title);
            }
        } catch (error) {
            console.error('Error handling favorite:', error);
        }
    };

    // ClipCard와 동일한 스타일 (배경 없음, hover만)
    const baseClass = 'favorite-button p-1.5 rounded-full transition-colors';
    const iconClass = isFavorite(clip.id)
        ? 'text-red-500 hover:text-red-400'
        : 'text-gray-400 hover:text-red-400';

    return (
        <button
            onClick={handleFavoriteClick}
            className={variant === 'icon' ? `${baseClass} ${iconClass}` : `favorite-button p-2 rounded-full transition-colors shadow ${isFavorite(clip.id)
                ? 'bg-red-500/90 text-white hover:bg-red-400'
                : 'bg-gray-700/80 text-gray-300 hover:bg-red-400 hover:text-white'}`}
            title={isFavorite(clip.id) ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        >
            <svg className="w-6 h-6" fill={isFavorite(clip.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        </button>
    );
}

export default FavoriteMusicButton; 