import React, { createContext, useContext, useState, useRef } from "react";

const PlaylistContext = createContext();

export function PlaylistProvider({ children }) {
    const [playlist, setPlaylist] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [repeatMode, setRepeatMode] = useState('none'); // 'none', 'all', 'one'
    const audioRef = useRef(null);

    const playAt = (index) => {
        setCurrentIndex(index);
        setIsPlaying(true);
    };

    const addToPlaylist = (clip) => {
        setPlaylist((prev) => [...prev, clip]);
        if (playlist.length === 0) {
            setCurrentIndex(0);
            setIsPlaying(true);
        }
    };

    const skipNext = () => {
        if (currentIndex < playlist.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsPlaying(true);  // 다음 곡 자동 재생
        } else if (repeatMode === 'all') {
            setCurrentIndex(0);  // 전체 반복일 경우 처음으로
            setIsPlaying(true);  // 처음 곡 자동 재생
        } else {
            setIsPlaying(false); // 마지막 곡이면 재생 중지
        }
    };

    const skipPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setIsPlaying(true);  // 이전 곡 자동 재생
        } else if (repeatMode === 'all') {
            setCurrentIndex(playlist.length - 1);  // 전체 반복일 경우 마지막으로
            setIsPlaying(true);  // 마지막 곡 자동 재생
        }
    };

    const toggleRepeatMode = () => {
        setRepeatMode(current => {
            switch (current) {
                case 'none':
                    return 'all';
                case 'all':
                    return 'one';
                case 'one':
                    return 'none';
                default:
                    return 'none';
            }
        });
    };

    return (
        <PlaylistContext.Provider
            value={{
                playlist,
                setPlaylist,
                currentIndex,
                isPlaying,
                setIsPlaying,
                playAt,
                addToPlaylist,
                skipNext,
                skipPrev,
                audioRef,
                repeatMode,
                toggleRepeatMode
            }}>
            {children}
        </PlaylistContext.Provider>
    );
}

export const usePlaylist = () => useContext(PlaylistContext);