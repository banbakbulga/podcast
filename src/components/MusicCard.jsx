import React, { useEffect, useState } from "react";
import axios from "axios";

function MusicCard({ title, artist, variant }) {
    const [musicInfo, setMusicInfo] = useState(null);

    useEffect(() => {
        const fetchMusic = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/search`, {
                    params: { title, artist },
                });
                setMusicInfo(res.data);
            } catch (err) {
                console.error("🎵 음악 검색 실패:", err);
            }
        };
        fetchMusic();
    }, [title, artist]);

    if (!musicInfo) {
        return (
            <div className="w-48 h-72 bg-gray-700 p-3 rounded-lg shadow text-sm text-gray-300">
                <p>
                    <strong>{title}</strong> - {artist} (검색 중...)
                </p>
            </div>
        );
    }

    // 🎯 MainPage 전용 스타일 분기
    if (variant === "main") {
        return (
            <div className="w-full bg-green-900/90 border-2 border-green-400 shadow-lg p-2 flex items-center min-h-[64px] min-w-[220px] max-w-[340px] rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-2xl">
                {musicInfo.image ? (
                    <img
                        src={musicInfo.image}
                        alt={musicInfo.title}
                        className="w-12 h-12 object-cover rounded mr-3 flex-shrink-0 border border-green-300"
                    />
                ) : (
                    <div className="w-12 h-12 bg-green-800 rounded mr-3 flex items-center justify-center border border-green-300">
                        <span className="text-2xl">🎵</span>
                    </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-white truncate max-w-[120px]">{musicInfo.title}</span>
                        <span className="text-xs text-green-200">{musicInfo.artist}</span>
                    </div>
                    {musicInfo.spotify_url && (
                        <a
                            href={musicInfo.spotify_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2 py-1 rounded bg-green-500 hover:bg-green-400 text-white text-center font-medium transition-all duration-200 mt-1 w-fit"
                            onClick={(e) => e.stopPropagation()}
                        >
                            Spotify로 듣기
                        </a>
                    )}
                </div>
            </div>
        );
    }

    // ✅ 기존 스타일은 그대로
    return (
        <div className="flex items-center gap-4 bg-gray-900 p-4 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:bg-gray-800">
            <img
                src={musicInfo.image}
                alt={musicInfo.title}
                className="w-32 h-32 rounded object-cover border border-gray-600 transition-transform duration-300 hover:scale-105"
            />
            <div className="flex flex-col flex-1">
                <h3 className="text-lg font-semibold text-white transition-colors duration-300 hover:text-green-400">{musicInfo.title}</h3>
                <p className="text-sm text-gray-300 transition-colors duration-300 hover:text-gray-200">{musicInfo.artist}</p>
                <div className="mt-1 flex gap-2">
                    {musicInfo.preview_url && (
                        <audio controls className="h-8">
                            <source src={musicInfo.preview_url} type="audio/mpeg" />
                        </audio>
                    )}
                    <a
                        href={musicInfo.spotify_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm px-3 py-1 rounded bg-green-500 hover:bg-green-400 text-white mt-5 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Spotify로 듣기
                    </a>
                </div>
            </div>
        </div>
    );
}

export default MusicCard;
