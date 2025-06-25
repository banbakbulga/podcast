import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MusicCard from "../components/MusicCard";

// ⏱ 초를 "분 초" 형식으로 변환
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}분 ${secs}초`;
}

function ReplayDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const audioRef = useRef(null);
    const [audioSrc, setAudioSrc] = useState("");
    const [jsonData, setJsonData] = useState([]);
    const [currentTime, setCurrentTime] = useState(0);
    const [selectedTag, setSelectedTag] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const dateMap = {
            1: "19921104",
            2: "19921107",
            3: "19921108",
            4: "19921110",
            5: "19921111",
            6: "19921112",
            7: "19921113",
            8: "19921116",
            9: "19921118",
            10: "19921119",
            11: "19930101",
            12: "19930102"
        };

        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const targetDate = dateMap[id];

                if (!targetDate) {
                    throw new Error("잘못된 날짜 ID입니다.");
                }

                setAudioSrc(`/audio/${targetDate}.mp3`);

                // 기본 JSON 파일만 로드
                const jsonResponse = await fetch(`/data/${targetDate}.json`);
                if (!jsonResponse.ok) {
                    throw new Error("데이터를 불러올 수 없습니다.");
                }

                const data = await jsonResponse.json();
                setJsonData(Array.isArray(data) ? data : []);
                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        loadData();
    }, [id, navigate]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (audioRef.current) {
                setCurrentTime(audioRef.current.currentTime);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handlePlayFrom = (start) => {
        if (audioRef.current) {
            audioRef.current.currentTime = start;
            audioRef.current.play().catch(err => {
                console.error("재생 중 오류 발생:", err);
                setError("오디오 재생 중 오류가 발생했습니다.");
            });
        }
    };

    const isActiveSegment = (clip) =>
        currentTime >= clip.start && currentTime < clip.end;

    const handleTagClick = (tag) => {
        setSelectedTag((prev) => (prev === tag ? null : tag));
    };

    const filteredData = selectedTag
        ? jsonData.filter((clip) => clip.tags?.includes(selectedTag))
        : jsonData;

    if (error) {
        return (
            <div className="bg-black text-white min-h-screen px-4 py-8">
                <Navbar />
                <div className="max-w-4xl mx-auto mt-8 p-4 bg-red-900/50 rounded-lg">
                    <h2 className="text-xl font-bold mb-2">❌ 오류 발생</h2>
                    <p>{error}</p>
                    <button
                        onClick={() => navigate('/replay')}
                        className="mt-4 px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
                    >
                        목록으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="bg-black text-white min-h-screen px-4 py-8">
                <Navbar />
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-400"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black text-white min-h-screen px-4 py-8">
            <Navbar />
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">📻 다시 듣기 상세</h1>
                    <button
                        onClick={() => navigate('/replay')}
                        className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
                    >
                        목록으로
                    </button>
                </div>

                {/* 🎧 오디오 플레이어 */}
                {audioSrc && (
                    <div className="mb-6 sticky top-0 bg-black/90 p-4 rounded-lg shadow-lg z-10">
                        <audio
                            ref={audioRef}
                            controls
                            className="w-full rounded shadow"
                            onError={() => setError("오디오 파일을 불러올 수 없습니다.")}
                        >
                            <source src={audioSrc} type="audio/mp3" />
                            브라우저가 오디오를 지원하지 않습니다.
                        </audio>
                    </div>
                )}

                {/* 🔍 태그 필터 표시 */}
                {selectedTag && (
                    <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                        <span className="text-blue-300 font-medium">
                            🎯 현재 필터: #{selectedTag}
                        </span>
                        <button
                            onClick={() => setSelectedTag(null)}
                            className="ml-4 px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm"
                        >
                            전체 보기
                        </button>
                    </div>
                )}

                {/* 📋 조각 리스트 */}
                {filteredData.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        데이터가 없습니다.
                    </div>
                ) : (
                    <ul className="space-y-6">
                        {filteredData.map((clip, i) => {
                            const isActive = isActiveSegment(clip);
                            return (
                                <li
                                    key={i}
                                    onClick={() => handlePlayFrom(clip.start)}
                                    className={`p-5 rounded-xl shadow-md transition duration-200 cursor-pointer 
                ${isActive ? "bg-gray-700 ring-2 ring-blue-400" : "bg-gray-800"} 
                                    hover:bg-gray-700 hover:shadow-xl`}
                                >
                                    <div className="text-lg font-semibold text-blue-400 flex items-center gap-2">
                                        {isActive && <span>🎶</span>}
                                        ⏱ {formatTime(clip.start)} ~ {formatTime(clip.end)}
                                    </div>

                                    <h3 className="text-xl font-semibold mt-2 text-yellow-400">
                                        {clip.title}
                                    </h3>

                                    <p className="mt-3 text-sm md:text-base text-gray-300">
                                        {clip.summary}
                                    </p>

                                    {clip.music && clip.music.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="font-bold mb-2 text-blue-300">🎵 음악 소개</h4>
                                            <div className="grid gap-2">
                                                {clip.music.map((m, j) => (
                                                    <MusicCard key={j} title={m.title} artist={m.artist} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {clip.story && (
                                        <p className="text-sm mt-3 text-gray-300">
                                            🧏 사연: {clip.story}
                                        </p>
                                    )}

                                    {clip.ad && (
                                        <p className="text-sm mt-2 text-gray-300">
                                            📢 광고: {clip.ad}
                                        </p>
                                    )}

                                    {clip.tags && clip.tags.length > 0 && (
                                        <div className="text-sm text-blue-300 mt-3 flex flex-wrap gap-2">
                                            {clip.tags.map((tag, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleTagClick(tag);
                                                    }}
                                                    className={`px-2 py-1 rounded border border-blue-400 hover:bg-blue-500 hover:text-white 
                        ${tag === selectedTag ? "bg-blue-400 text-black" : ""}`}
                                                >
                                                    #{tag}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default ReplayDetail;
