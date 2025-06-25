import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePlaylist } from "../context/PlaylistContext";
import axios from "axios";
import PlayerInfo from "./PlayerInfo";
import PlayerControls from "./PlayerControls";
import PlayerProgress from "./PlayerProgress";
import PlaylistDrawer from "./PlaylistDrawer";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const {
        playlist,
        currentIndex,
        isPlaying,
        setIsPlaying,
        skipNext,
        skipPrev,
        audioRef,
        setPlaylist,
        repeatMode,
        toggleRepeatMode,
    } = usePlaylist();

    const currentClip = playlist[currentIndex];
    const [showDrawer, setShowDrawer] = React.useState(false);
    const [showProfileMenu, setShowProfileMenu] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const [albumInfo, setAlbumInfo] = React.useState(null);
    const [profileInfo, setProfileInfo] = React.useState(null);
    const profileMenuRef = React.useRef(null);

    // "소개" 링크 클릭 시, 메인 페이지의 #intro 섹션으로 부드럽게 스크롤
    const scrollToIntro = (e) => {
        e.preventDefault();
        const introSection = document.getElementById("intro");
        if (introSection) {
            introSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    // 프로필 메뉴 외부 클릭 감지
    React.useEffect(() => {
        function handleClickOutside(event) {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        setShowProfileMenu(false);
        await logout();
        navigate('/');
    };

    // 앨범 정보 로드
    React.useEffect(() => {
        const fetchAlbumInfo = async () => {
            if (!currentClip?.music?.[0] || !user) {
                setAlbumInfo(null);
                return;
            }

            try {
                const { title, artist } = currentClip.music[0];
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/spotify/search`, {
                    params: {
                        q: `${title} ${artist}`,
                        type: 'track',
                        limit: 1
                    },
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });

                if (response.data.tracks.items.length > 0) {
                    const track = response.data.tracks.items[0];
                    setAlbumInfo({
                        image: track.album.images[0].url,
                        spotifyUrl: track.external_urls.spotify
                    });
                } else {
                    setAlbumInfo(null);
                }
            } catch (error) {
                console.error("앨범 정보 불러오기 실패:", error);
                setAlbumInfo(null);
            }
        };

        fetchAlbumInfo();
    }, [currentClip, user]);

    // 오디오 소스 및 재생 상태 관리
    React.useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentClip) return;

        const src = `/audio/${currentClip.date}.mp3`;
        if (!audio.src.endsWith(src)) {
            audio.src = src;
        }

        const handleMetadata = () => {
            audio.currentTime = currentClip.start;
            if (isPlaying) audio.play().catch(console.warn);
        };

        audio.addEventListener("loadedmetadata", handleMetadata);
        return () => audio.removeEventListener("loadedmetadata", handleMetadata);
    }, [currentClip, isPlaying]);

    // 재생/일시정지 상태 관리
    React.useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.play().catch(console.warn);
        } else {
            audio.pause();
        }
    }, [isPlaying]);

    // 진행 상태 업데이트 및 클립 종료 체크
    React.useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentClip) return;

        const handleTimeUpdate = () => {
            // 현재 진행률 계산
            const elapsed = audio.currentTime - currentClip.start;
            const duration = currentClip.end - currentClip.start;
            const currentProgress = Math.min((elapsed / duration) * 100, 100);
            setProgress(currentProgress);

            // 클립 종료 체크
            if (audio.currentTime >= currentClip.end) {
                if (repeatMode === 'one') {
                    // 한 곡 반복
                    audio.currentTime = currentClip.start;
                    audio.play().catch(console.warn);
                } else {
                    // 다음 곡으로 넘어가기 (전체 반복 포함)
                    audio.pause();
                    skipNext();
                }
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
    }, [currentClip, currentIndex, playlist.length, repeatMode, skipNext]);

    const handleSeek = (e) => {
        const audio = audioRef.current;
        if (!audio || !currentClip) return;

        const ratio = e.nativeEvent.offsetX / e.currentTarget.clientWidth;
        const newTime = currentClip.start + (currentClip.end - currentClip.start) * ratio;

        // 시크바 이동 시 클립의 시작과 끝 시간 범위를 벗어나지 않도록 제한
        audio.currentTime = Math.max(
            currentClip.start,
            Math.min(newTime, currentClip.end)
        );

        setProgress(ratio * 100);
    };

    // 프로필 정보 로드
    React.useEffect(() => {
        const fetchProfileInfo = async () => {
            if (!user?.token) {
                console.log("토큰이 없습니다.");
                return;
            }

            try {
                console.log("프로필 정보 요청 시작");
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/spotify/me`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                    withCredentials: true
                });

                console.log("프로필 응답:", response.data);

                if (response.data) {
                    setProfileInfo({
                        name: response.data.display_name || '사용자',
                        email: response.data.email,
                        image: response.data.images && response.data.images.length > 0
                            ? response.data.images[0].url
                            : null,
                        followers: response.data.followers || 0,
                        product: response.data.product || 'free'
                    });
                }
            } catch (error) {
                console.error("프로필 정보 로드 실패:", error.response?.data || error.message);
                setProfileInfo(null);
            }
        };

        fetchProfileInfo();
    }, [user]);

    return (
        <header className="bg-black/95 backdrop-blur-md h-14 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-[9999] shadow-lg">
            {/* 왼쪽: 프로그램명 */}
            <div className="font-bold text-lg min-w-[240px] pl-4">
                <Link to="/" className="hover:text-gray-300">
                    정은임의 영화음악
                </Link>
            </div>

            {/* 중앙: 플레이어 컨트롤 */}
            <div className="flex-1 mx-32">
                {currentClip ? (
                    <div className="flex items-center gap-4">
                        <PlayerInfo
                            albumInfo={albumInfo}
                            title={currentClip.title}
                            artist={currentClip.music?.[0]?.artist || "Unknown"}
                            start={currentClip.start}
                            end={currentClip.end}
                        />
                        <div className="flex flex-col flex-1 mx-4">
                            <div className="flex items-center gap-4 justify-center mt-1">
                                <PlayerControls
                                    isPlaying={isPlaying}
                                    onPlayPause={() => setIsPlaying(p => !p)}
                                    onPrev={skipPrev}
                                    onNext={skipNext}
                                />
                                <button
                                    onClick={toggleRepeatMode}
                                    className={`text-gray-400 hover:text-white transition-colors ${repeatMode !== 'none' ? '!text-white' : ''}`}
                                    title={`반복 모드: ${repeatMode === 'none' ? '반복 없음' : repeatMode === 'all' ? '전체 반복' : '한 곡 반복'}`}
                                >
                                    {repeatMode === 'one' ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            <text x="11" y="15" className="text-xs font-bold" fill="currentColor" textAnchor="middle">1</text>
                                        </svg>
                                    ) : repeatMode === 'all' ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeDasharray="4 4" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <PlayerProgress progress={progress} onSeek={handleSeek} />
                        </div>
                        <button
                            onClick={() => setShowDrawer(true)}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="플레이리스트"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div className="text-center text-gray-400">🎵 플레이리스트에 추가된 곡이 없습니다.</div>
                )}
                <audio ref={audioRef} hidden />
            </div>

            {/* 오른쪽: 프로필 메뉴 */}
            <div className="min-w-[240px] flex justify-end pr-4">
                {user ? (
                    <div className="relative" ref={profileMenuRef}>
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800 flex items-center"
                        >
                            {profileInfo?.image ? (
                                <img
                                    src={profileInfo.image}
                                    alt="Profile"
                                    className="w-6 h-6 rounded-full"
                                />
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </button>

                        {/* 드롭다운 메뉴 */}
                        {showProfileMenu && (
                            <div className="absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5">
                                <div className="py-1" role="menu">
                                    {/* 프로필 헤더 */}
                                    <div className="px-4 py-3 border-b border-gray-700">
                                        <div className="flex items-center gap-3">
                                            {profileInfo?.image ? (
                                                <img
                                                    src={profileInfo.image}
                                                    alt="Profile"
                                                    className="w-12 h-12 rounded-full"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-white">
                                                    {profileInfo?.name || user.email}
                                                </div>
                                                <div className="text-sm text-gray-400">
                                                    {profileInfo?.email}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                                            <div>팔로워 {profileInfo?.followers || 0}</div>
                                            <div>{profileInfo?.product === 'premium' ? 'Premium' : 'Free'}</div>
                                        </div>
                                    </div>
                                    {/* 메뉴 아이템 */}
                                    <Link
                                        to="/mypage"
                                        className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                                        role="menuitem"
                                        onClick={() => setShowProfileMenu(false)}
                                    >
                                        마이페이지
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                                        role="menuitem"
                                    >
                                        로그아웃
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link
                        to="/login"
                        className="bg-[#1DB954] hover:bg-[#1ed760] text-white px-3 py-1.5 rounded-md text-sm"
                    >
                        Spotify 로그인
                    </Link>
                )}
            </div>

            <PlaylistDrawer
                isOpen={showDrawer}
                onClose={() => setShowDrawer(false)}
                onRemove={(idx) => {
                    setPlaylist(prev => prev.filter((_, i) => i !== idx));
                }}
            />
        </header>
    );
}

export default Navbar;
