import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlaylist } from '../context/PlaylistContext';
import { useFavorites } from '../context/FavoritesContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import PlaylistDetailModal from '../components/PlaylistDetailModal';
import * as playlistApi from '../utils/playlistApi';

function MyPage() {
    const { user } = useAuth();
    const { favorites, removeFromFavorites, loading: favoritesLoading } = useFavorites();
    const { addToPlaylist, playAt, playlist } = usePlaylist();
    const [recentPlays, setRecentPlays] = useState([]);
    const [stats, setStats] = useState({
        totalListens: 0,
        favoriteGenre: '',
        listeningTime: 0
    });
    const [loading, setLoading] = useState(true);
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [showPlaylistDetail, setShowPlaylistDetail] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;

            try {
                // 사용자 통계 데이터 가져오기
                const statsResponse = await axios.get(`/api/users/${user.id}/stats`);
                setStats(statsResponse.data);

                // 최근 재생 기록 가져오기
                const playsResponse = await axios.get(`/api/users/${user.id}/recent-plays`);
                setRecentPlays(playsResponse.data);

                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    useEffect(() => {
        if (!user) return;
        playlistApi.getPlaylists(user.id).then(setPlaylists);
    }, [user]);

    const handlePlayNow = (clip) => {
        addToPlaylist(clip);
        setTimeout(() => {
            playAt(playlist.length);
        }, 0);
    };

    const formatListeningTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        return `${hours} 시간`;
    };

    // 플레이리스트 카드 클릭 시 상세 모달 오픈
    const handleOpenPlaylist = (playlist) => {
        setSelectedPlaylist(playlist);
        setShowPlaylistDetail(true);
    };

    // 모달에서 클립 재생
    const handlePlayClip = (clip) => {
        addToPlaylist(clip);
        setTimeout(() => {
            playAt(playlist.length);
        }, 0);
    };

    // 모달에서 클립 삭제
    const handleRemoveClip = async (clipId) => {
        if (!selectedPlaylist || !user) return;
        await playlistApi.removeClipFromPlaylist(user.id, selectedPlaylist._id, { id: clipId });
        // 최신 목록 다시 불러오기
        const fresh = await playlistApi.getPlaylists(user.id);
        setPlaylists(fresh);
        // 선택된 플레이리스트도 업데이트
        const updated = fresh.find(pl => pl._id === selectedPlaylist._id);
        setSelectedPlaylist(updated);
    };

    // 플레이리스트 이름 변경
    const handleRenamePlaylist = async (newName) => {
        if (!selectedPlaylist || !user) return;
        await playlistApi.renamePlaylist(user.id, selectedPlaylist._id, newName);
        const fresh = await playlistApi.getPlaylists(user.id);
        setPlaylists(fresh);
        const updated = fresh.find(pl => pl._id === selectedPlaylist._id);
        setSelectedPlaylist(updated);
    };

    // 플레이리스트 삭제
    const handleDeletePlaylist = async () => {
        if (!selectedPlaylist || !user) return;
        await playlistApi.deletePlaylist(user.id, selectedPlaylist._id);
        const fresh = await playlistApi.getPlaylists(user.id);
        setPlaylists(fresh);
        setShowPlaylistDetail(false);
        setSelectedPlaylist(null);
    };

    if (loading || favoritesLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
                    <div className="text-gray-400">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* 프로필 섹션 */}
                <section className="mb-12">
                    <div className="flex items-center gap-8">
                        <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center">
                            {user?.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt="Profile"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <svg className="w-20 h-20 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">{user?.name || user?.email}</h1>
                            <div className="flex gap-8 text-gray-400">
                                <div>
                                    <div className="text-2xl font-semibold text-white">{stats.totalListens}</div>
                                    <div className="text-sm">재생 횟수</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-semibold text-white">{formatListeningTime(stats.listeningTime)}</div>
                                    <div className="text-sm">청취 시간</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-semibold text-white">{stats.favoriteGenre}</div>
                                    <div className="text-sm">선호 장르</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 즐겨찾기 */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">즐겨찾기</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {favorites.map((clip) => (
                            <div
                                key={clip.clip_id}
                                className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 hover:bg-gray-800/70 transition-colors cursor-pointer"
                                onClick={() => handlePlayNow(clip)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-700 rounded-md flex items-center justify-center">
                                        {clip.thumbnail ? (
                                            <img
                                                src={clip.thumbnail}
                                                alt={clip.title}
                                                className="w-full h-full rounded-md object-cover"
                                            />
                                        ) : (
                                            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white font-medium text-lg truncate">{clip.title}</div>
                                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                            <span>{clip.displayDate}</span>
                                            <span>•</span>
                                            <span>{clip.duration || '00:00'}</span>
                                        </div>
                                    </div>
                                    <button
                                        className="text-red-500 hover:text-red-400 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFromFavorites(clip.clip_id);
                                        }}
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 최근 재생 기록 */}
                <section>
                    <h2 className="text-2xl font-bold text-white mb-6">최근 재생</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentPlays.map((play) => (
                            <div
                                key={play.id}
                                className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 hover:bg-gray-800/70 transition-colors cursor-pointer"
                                onClick={() => handlePlayNow(play)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-700 rounded-md flex items-center justify-center">
                                        {play.thumbnail ? (
                                            <img
                                                src={play.thumbnail}
                                                alt={play.title}
                                                className="w-full h-full rounded-md object-cover"
                                            />
                                        ) : (
                                            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white font-medium truncate">{play.title}</div>
                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                            <span>{new Date(play.playedAt).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{play.duration}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 내 플레이리스트 섹션 */}
                <section className="mt-10">
                    <h2 className="text-xl font-bold text-white mb-4">내 플레이리스트</h2>
                    {playlists.length === 0 ? (
                        <div className="text-gray-400">플레이리스트가 없습니다.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                            {playlists.map(pl => (
                                <div key={pl._id} className="bg-gray-800/60 rounded-xl shadow p-4 flex flex-col items-start cursor-pointer hover:bg-gray-700/60 transition-colors" onClick={() => handleOpenPlaylist(pl)}>
                                    <div className="font-semibold text-white text-lg mb-2 truncate">{pl.name}</div>
                                    <div className="text-xs text-gray-400 mb-2">{pl.clips.length}개의 클립</div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* 플레이리스트 상세 모달 */}
            {showPlaylistDetail && selectedPlaylist && (
                <PlaylistDetailModal
                    playlist={selectedPlaylist}
                    onClose={() => setShowPlaylistDetail(false)}
                    onPlay={handlePlayClip}
                    onRemoveClip={handleRemoveClip}
                    onRename={handleRenamePlaylist}
                    onDelete={handleDeletePlaylist}
                />
            )}
        </div>
    );
}

export default MyPage;