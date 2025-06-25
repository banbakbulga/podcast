import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

// 태그별 색상 매핑
const tagColors = {
    영화: 'bg-blue-400/40 text-white',
    OST: 'bg-purple-400/40 text-white',
    오프닝: 'bg-green-400/40 text-white',
    사연: 'bg-yellow-200/40 text-white',
    광고: 'bg-red-400/40 text-white',
    즐겨찾기: 'bg-pink-300/40 text-white',
    // 기본값
    default: 'bg-gray-400/40 text-white',
};

function ClipCard({ clip, onPlay, onAddToPlaylist, className = '' }) {
    const { user } = useAuth();
    const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();

    const formatDate = (dateStr) => {
        const date = new Date(dateStr.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        const weekday = weekdays[date.getDay()];
        return `${month}월 ${day}일 (${weekday}요일)`;
    };

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

    return (
        <div className={`bg-gray-800/60 rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 group ${className}`}>
            <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                            {clip.title}
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">
                            {formatDate(clip.date)}
                        </p>
                        <p className="text-sm text-gray-300 line-clamp-2 mb-4">
                            {clip.summary}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {user && (
                            <button
                                onClick={handleFavoriteClick}
                                className={`p-2 rounded-full transition-colors ${isFavorite(clip.id)
                                    ? 'bg-red-500 hover:bg-red-400 text-white'
                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-400'
                                    }`}
                                title={isFavorite(clip.id) ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                            >
                                <svg className="w-5 h-5" fill={isFavorite(clip.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        )}
                        <button
                            onClick={() => onPlay(clip)}
                            className="p-2 rounded-full bg-blue-500 hover:bg-blue-400 text-white transition-colors"
                            title="재생"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => onAddToPlaylist(clip)}
                            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                            title="플레이리스트에 추가"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                </div>

                {clip.tags && clip.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {clip.tags.map((tag, idx) => (
                            <span
                                key={idx}
                                className={`px-2 py-1 text-xs rounded-full font-semibold ${tagColors[tag] || tagColors.default}`}
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ClipCard; 