import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MusicCard from "../components/MusicCard";
import jeongImg from "../img/jeong.jpg";
import { usePlaylist } from "../context/PlaylistContext";

const categories = [
    {
        id: 'recommended',
        title: '영화 음악',
        icon: '🎵',
        description: '영화 음악 클립 모음',
        color: 'from-purple-500 to-pink-500'
    },
    {
        id: 'movies',
        title: '영화',
        icon: '🎬',
        description: '영화 관련 클립 모음',
        color: 'from-blue-500 to-teal-500'
    },
    {
        id: 'opening',
        title: '오프닝',
        icon: '🎤',
        description: '프로그램 오프닝 모음',
        color: 'from-green-500 to-emerald-500'
    },
    {
        id: 'stories',
        title: '청취자 사연',
        icon: '📖',
        description: '감동적인 청취자 사연',
        color: 'from-yellow-500 to-orange-500'
    },
    {
        id: 'ads',
        title: '광고',
        icon: '📢',
        description: '추억의 광고 모음',
        color: 'from-red-500 to-pink-500'
    },
    {
        id: 'replay',
        title: '다시듣기',
        icon: '📅',
        description: '날짜별 방송 다시듣기',
        color: 'from-indigo-500 to-blue-500'
    }
];

function MainPage() {
    const [recommendedSongs, setRecommendedSongs] = useState([]);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);
    const sliderRef = useRef(null);
    const { addToPlaylist, playAt, playlist } = usePlaylist();
    const [movieSegments, setMovieSegments] = useState([]);
    const [listenerStories, setListenerStories] = useState([]);
    const [openingSegments, setOpeningSegments] = useState([]);
    const [adSegments, setAdSegments] = useState([]);
    const navigate = useNavigate();

    const shuffleArray = (array) => {
        let shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    useEffect(() => {
        const fetchClips = async () => {
            try {
                const allClips = [];
                const dates = [
                    "19921104", "19921107", "19921108", "19921110", "19921111",
                    "19921112", "19921113", "19921116", "19921118", "19921119",
                    "19930101", "19930102", "19930201", "19930301"
                ];

                for (let date of dates) {
                    const res = await axios.get(`/data/${date}.json`);
                    const clips = res.data.map((clip) => ({ ...clip, date }));
                    allClips.push(...clips);
                }

                const musicClips = allClips.filter(clip => clip.music?.length > 0);
                setRecommendedSongs(shuffleArray(musicClips));

                // "영화" 태그가 포함된 조각 필터링
                const movies = allClips.filter(segment => segment.tags.includes("영화"));
                setMovieSegments(movies);

                // "오프닝" 태그가 포함된 조각 필터링
                const openings = allClips.filter(segment => segment.tags.includes("오프닝"));
                setOpeningSegments(openings);

                // "사연" 태그가 포함된 조각 필터링
                const stories = allClips.filter(segment => segment.tags.includes("사연"));
                setListenerStories(stories);

                // "광고" 태그가 포함된 조각 필터링
                const ads = allClips.filter(segment => segment.tags.includes("광고"));
                setAdSegments(ads);

            } catch (err) {
                console.error("📥 클립 로딩 실패:", err);
            }
        };
        fetchClips();
    }, []);

    useEffect(() => {
        checkScrollButtons();
    }, [recommendedSongs]);

    const checkScrollButtons = () => {
        const el = sliderRef.current;
        if (!el) return;
        setShowLeft(el.scrollLeft > 0);
        setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    };

    const scrollLeft = () => {
        sliderRef.current.scrollBy({ left: -sliderRef.current.clientWidth, behavior: "smooth" });
        setTimeout(checkScrollButtons, 300);
    };

    const scrollRight = () => {
        sliderRef.current.scrollBy({ left: sliderRef.current.clientWidth, behavior: "smooth" });
        setTimeout(checkScrollButtons, 300);
    };

    const handlePlayNow = (clip) => {
        addToPlaylist(clip);
        // 재생 타이밍 문제 방지를 위해 다음 렌더 사이클에서 실행
        setTimeout(() => {
            playAt(playlist.length); // 새로 추가된 마지막 index 재생
        }, 0);
    };

    const handleCategoryClick = (categoryId) => {
        if (categoryId === 'replay') {
            navigate('/replay');
        } else {
            navigate(`/category/${categoryId}`);
        }
    };

    return (
        <div className="bg-gradient-to-b from-black via-gray-800 to-black text-white min-h-screen">
            <Navbar />

            <header className="relative px-6 pt-16 pb-6 bg-cover bg-center" style={{ backgroundImage: "url('/path/to/hero-image.jpg')" }}>
                <h1 className="text-2xl sm:text-5xl md:text-5xl font-bold text-white mb-5">정은임의 영화음악</h1>
                <p className="text-lg sm:text-2xl md:text-2xl text-white">
                    MBC 라디오의 인기 프로그램, 정은임의 FM영화음악을 이제 온라인에서도 만나보세요.
                </p>
            </header>

            <main className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            className={`bg-gradient-to-br ${category.color} 
                                p-8 rounded-2xl shadow-lg hover:shadow-2xl 
                                transform hover:scale-105 transition-all cursor-pointer
                                hover:ring-2 hover:ring-white hover:ring-opacity-50
                                aspect-[3/4] flex flex-col justify-between
                                relative overflow-hidden group`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="flex flex-col h-full">
                                <div className="mb-auto">
                                    <span className="text-5xl mb-6 block">{category.icon}</span>
                                    <h2 className="text-3xl font-bold mb-4">{category.title}</h2>
                                    <p className="text-lg text-white/90">{category.description}</p>
                                </div>

                                <div className="mt-auto pt-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                    <span className="text-white/90 text-sm flex items-center">
                                        자세히 보기
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            {/* 소개 섹션은 유지 */}
            <section id="intro" className="px-6 py-16 text-gray-300">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10 items-center">
                    <div className="flex-shrink-0 w-full md:w-1/3">
                        <img src={jeongImg} alt="정은임 아나운서" className="rounded-lg shadow-lg w-full object-cover aspect-[3/4]" />
                    </div>
                    <div className="flex-1 text-left">
                        <h2 className="text-3xl font-semibold text-white mb-4">🎙 정은임 아나운서 소개</h2>
                        <p className="mb-4">정은임 아나운서는 1992년 MBC 아나운서로 입사해 "FM 영화음악"을 통해 깊은 영화 사랑과 진솔한 목소리로 청취자들에게 사랑을 받았습니다.</p>
                        <p className="mb-4">특히 1992~1995년, 2003년 복귀 방송 당시 영화 비평가 정성일, 실험정신 가득한 PD 홍동식과 함께 컬트적인 지지를 이끌었으며, 박찬욱 감독도 게스트로 참여한 바 있습니다.</p>
                        <p className="mb-4">2024년 MBC는 그녀의 20주기를 맞아 특집 다큐멘터리 방송과 추모 공개방송을 진행하였으며, 명예 골든마우스를 수상했습니다.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default MainPage;
