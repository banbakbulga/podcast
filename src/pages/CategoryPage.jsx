import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { usePlaylist } from '../context/PlaylistContext';
import MusicCard from '../components/MusicCard';
import MovieInfo from '../components/MovieInfo';
import ClipCard from '../components/ClipCard';
import FavoriteMusicButton from '../components/FavoriteMusicButton';
import PlaylistModal from '../components/PlaylistModal';
import { useAuth } from '../context/AuthContext';
import * as playlistApi from '../utils/playlistApi';

const categoryInfo = {
    recommended: {
        title: '영화 음악',
        icon: '🎵',
        description: '영화 음악을 만나보세요',
        color: 'from-purple-500 to-pink-500',
        filter: (clip) => clip.music?.length > 0
    },
    movies: {
        title: '영화',
        icon: '🎬',
        description: '영화 관련 클립 모음',
        color: 'from-blue-500 to-teal-500',
        filter: (clip) => clip.tags.includes('영화')
    },
    opening: {
        title: '오프닝',
        icon: '🎤',
        description: '프로그램 오프닝 모음',
        color: 'from-green-500 to-emerald-500',
        filter: (clip) => clip.tags.includes('오프닝')
    },
    stories: {
        title: '청취자 사연',
        icon: '📖',
        description: '감동적인 청취자 사연',
        color: 'from-yellow-500 to-orange-500',
        filter: (clip) => clip.tags.includes('사연')
    },
    ads: {
        title: '광고',
        icon: '📢',
        description: '추억의 광고 모음',
        color: 'from-red-500 to-pink-500',
        filter: (clip) => clip.tags.includes('광고')
    },
    replay: {
        title: '다시듣기',
        icon: '📅',
        description: '날짜별 방송 다시듣기',
        color: 'from-indigo-500 to-blue-500',
        filter: () => true // 모든 클립 포함
    }
};

const dateList = [
    { date: "19921104", display: "1992년 11월 4일(수요일)" },
    { date: "19921107", display: "1992년 11월 7일(토요일)" },
    { date: "19921108", display: "1992년 11월 8일(일요일)" },
    { date: "19921110", display: "1992년 11월 10일(월요일)" },
    { date: "19921111", display: "1992년 11월 11일(수요일)" },
    { date: "19921112", display: "1992년 11월 12일(목요일)" },
    { date: "19921113", display: "1992년 11월 13일(금요일)" },
    { date: "19921116", display: "1992년 11월 16일(월요일)" },
    { date: "19921118", display: "1992년 11월 18일(수요일)" },
    { date: "19921119", display: "1992년 11월 19일(목요일)" },
    { date: "19930101", display: "1993년 1월 1일(금요일)" },
    { date: "19930102", display: "1993년 1월 2일(토요일)" },
    { date: "19930201", display: "1993년 2월 1일(월요일)" },
    { date: "19930301", display: "1993년 3월 1일(월요일)" },
];

function CategoryPage() {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [clips, setClips] = useState([]);
    const { addToPlaylist, playAt, playlist } = usePlaylist();
    const category = categoryInfo[categoryId];
    const { user } = useAuth();
    const [playlists, setPlaylists] = useState([]);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [selectedClip, setSelectedClip] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredClipId, setHoveredClipId] = useState(null);

    // Group clips by year and month
    const groupedClips = useMemo(() => {
        const groups = {};
        clips.forEach(clip => {
            const date = new Date(clip.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
            const year = date.getFullYear();
            const month = date.getMonth() + 1;

            if (!groups[year]) {
                groups[year] = {};
            }
            if (!groups[year][month]) {
                groups[year][month] = [];
            }
            groups[year][month].push(clip);
        });
        return groups;
    }, [clips]);

    // Get unique years and months for filtering
    const years = useMemo(() => Object.keys(groupedClips).sort((a, b) => b - a), [groupedClips]);
    const months = useMemo(() => {
        if (!selectedYear) return [];
        return Object.keys(groupedClips[selectedYear] || {}).sort((a, b) => b - a);
    }, [groupedClips, selectedYear]);

    // Filter clips based on search query and selected year/month
    const filteredClips = useMemo(() => {
        let filtered = clips;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(clip =>
                clip.title.toLowerCase().includes(query) ||
                clip.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        if (selectedYear) {
            filtered = filtered.filter(clip => {
                const date = new Date(clip.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
                return date.getFullYear() === parseInt(selectedYear);
            });
        }

        if (selectedMonth) {
            filtered = filtered.filter(clip => {
                const date = new Date(clip.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
                return date.getMonth() + 1 === parseInt(selectedMonth);
            });
        }

        return filtered;
    }, [clips, searchQuery, selectedYear, selectedMonth]);

    useEffect(() => {
        if (!category) {
            navigate('/');
            return;
        }

        const fetchClips = async () => {
            try {
                const allClips = [];
                const dates = dateList.map(d => d.date);

                for (let date of dates) {
                    const res = await axios.get(`/data/${date}.json`);
                    const dateClips = res.data.map((clip) => ({
                        ...clip,
                        date,
                        id: `${date}-${clip.start}-${clip.end}`,
                        displayDate: dateList.find(d => d.date === date)?.display
                    }));
                    allClips.push(...dateClips);
                }

                if (categoryId === 'replay') {
                    // 날짜별로 그룹화
                    const groupedByDate = {};
                    allClips.forEach(clip => {
                        if (!groupedByDate[clip.date]) {
                            groupedByDate[clip.date] = {
                                date: clip.date,
                                displayDate: clip.displayDate,
                                clips: []
                            };
                        }
                        groupedByDate[clip.date].clips.push(clip);
                    });
                    setClips(Object.values(groupedByDate));
                } else if (categoryId === 'movies') {
                    // 영화 카테고리인 경우 영화 태그가 있는 클립만 필터링
                    const filteredClips = allClips.filter(clip => clip.tags.includes('영화'));
                    setClips(filteredClips);
                } else {
                    const filteredClips = allClips.filter(category.filter);
                    setClips(filteredClips);
                }
            } catch (err) {
                console.error("Error loading clips:", err);
            }
        };

        fetchClips();
    }, [categoryId, category, navigate]);

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

    // 플레이리스트 추가 핸들러
    const handleAddToPlaylist = (clip) => {
        setSelectedClip(clip);
        setShowPlaylistModal(true);
    };

    // 모달에서 실제 추가 처리
    const handlePlaylistAdd = async (playlistId, newName) => {
        if (!user) return;
        let targetId = playlistId;
        let updatedPlaylists = [...playlists];
        if (newName) {
            // 새 플레이리스트 생성
            const newPl = await playlistApi.createPlaylist(user.id, newName);
            targetId = newPl._id;
            updatedPlaylists.push(newPl);
        }
        // 해당 플레이리스트에 clip 추가 (중복 방지)
        const clip = selectedClip;
        await playlistApi.addClipToPlaylist(user.id, targetId, clip);
        // 최신 목록 다시 불러오기
        const fresh = await playlistApi.getPlaylists(user.id);
        setPlaylists(fresh);
        setShowPlaylistModal(false);
        setSelectedClip(null);
    };

    if (!category) return null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
            <Navbar />

            <header className={`bg-gradient-to-r ${category.color} p-8 relative`}>
                <button
                    onClick={() => navigate('/')}
                    className="absolute top-4 left-4 text-white hover:text-gray-200"
                >
                    ← 뒤로가기
                </button>
                <div className="max-w-4xl mx-auto pt-8">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-4xl">{category.icon}</span>
                        <h1 className="text-3xl font-bold">{category.title}</h1>
                    </div>
                    <p className="text-lg opacity-90">{category.description}</p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Search Section */}
                <div className="mb-8">
                    <input
                        type="text"
                        placeholder="제목이나 태그로 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Year/Month Filter Section */}
                <div className="mb-8 flex gap-4">
                    <select
                        value={selectedYear || ''}
                        onChange={(e) => {
                            setSelectedYear(e.target.value || null);
                            setSelectedMonth(null);
                        }}
                        className="px-4 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">전체 연도</option>
                        {years.map(year => (
                            <option key={year} value={year}>{year}년</option>
                        ))}
                    </select>
                    <select
                        value={selectedMonth || ''}
                        onChange={(e) => setSelectedMonth(e.target.value || null)}
                        className="px-4 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!selectedYear}
                    >
                        <option value="">전체 월</option>
                        {months.map(month => (
                            <option key={month} value={month}>{month}월</option>
                        ))}
                    </select>
                </div>

                {filteredClips.length === 0 && (
                    <p className="text-gray-400 text-center mt-4">
                        검색 결과가 없습니다.
                    </p>
                )}

                {/* Timeline View */}
                <div className="space-y-12">
                    {Object.entries(groupedClips)
                        .filter(([year]) => !selectedYear || year === selectedYear)
                        .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA))
                        .map(([year, months]) => (
                            <div key={year} className="relative">
                                <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm py-4 z-10">
                                    <h2 className="text-2xl font-bold text-white">{year}년</h2>
                                </div>
                                <div className="space-y-8 mt-4">
                                    {Object.entries(months)
                                        .filter(([month]) => !selectedMonth || month === selectedMonth)
                                        .sort(([monthA], [monthB]) => parseInt(monthB) - parseInt(monthA))
                                        .map(([month, monthClips]) => (
                                            <div key={`${year}-${month}`} className="relative pl-8 border-l-2 border-gray-700">
                                                <div className="absolute -left-5 top-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg z-10">
                                                    <span className="text-xs font-bold text-white drop-shadow-sm">{month}월</span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                                                    {monthClips
                                                        .filter(clip => clip && clip.title)
                                                        .filter(clip => {
                                                            if (!searchQuery) return true;
                                                            const query = searchQuery.toLowerCase();
                                                            return clip.title.toLowerCase().includes(query) ||
                                                                clip.tags.some(tag => tag.toLowerCase().includes(query));
                                                        })
                                                        .map((clip) => (
                                                            <div
                                                                key={clip.id}
                                                                className="relative group flex flex-col w-full"
                                                                onMouseEnter={() => setHoveredClipId(clip.id)}
                                                                onMouseLeave={() => setHoveredClipId(null)}
                                                            >
                                                                <ClipCard
                                                                    clip={clip}
                                                                    onPlayNow={handlePlayNow}
                                                                    onAddToPlaylist={handleAddToPlaylist}
                                                                />
                                                                {/* Hover Info */}
                                                                {hoveredClipId === clip.id && (
                                                                    <div className="absolute left-0 right-0 top-full mt-2 z-20 pointer-events-none">
                                                                        {categoryId === 'movies' && (
                                                                            <MovieInfo movieTitle={clip.title.split(' - ')[0]} />
                                                                        )}
                                                                        {categoryId === 'recommended' && clip.music?.length > 0 && (
                                                                            <MusicCard title={clip.music[0].title} artist={clip.music[0].artist} variant="main" />
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                </div>
            </main>

            {/* Playlist Modal */}
            {showPlaylistModal && (
                <PlaylistModal
                    playlists={playlists}
                    onClose={() => {
                        setShowPlaylistModal(false);
                        setSelectedClip(null);
                    }}
                    onAdd={handlePlaylistAdd}
                />
            )}
        </div>
    );
}

export default CategoryPage; 