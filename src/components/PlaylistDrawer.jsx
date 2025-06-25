// 📁 components/PlaylistDrawer.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlaylist } from "../context/PlaylistContext";

function PlaylistDrawer({ isOpen, onClose }) {
    const { playlist, currentIndex, playAt, setPlaylist } = usePlaylist();

    // 플레이리스트를 현재 재생 중, 대기 중으로 분류
    const categorizedPlaylist = {
        current: playlist[currentIndex],
        upcoming: playlist.slice(currentIndex + 1),
        previous: playlist.slice(0, currentIndex)
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
    };

    const handleRemove = (index) => {
        const newPlaylist = [...playlist];
        newPlaylist.splice(index, 1);
        setPlaylist(newPlaylist);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* 배경 오버레이 */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black opacity-50 z-[9998]"
                        onClick={onClose}
                    />

                    {/* 드로어 */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "tween", duration: 0.3 }}
                        className="fixed right-0 top-0 bottom-0 w-96 bg-[#121212] shadow-xl z-[9999] flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* 헤더 */}
                        <div className="p-4 border-b border-[#282828]">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-white">재생목록</h2>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* 컨텐츠 */}
                        <div className="flex-1 overflow-y-auto bg-[#121212]">
                            {playlist.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                    <p>재생목록이 비어 있습니다</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#282828] h-full bg-[#121212]">
                                    {/* 현재 재생 중인 항목 */}
                                    {categorizedPlaylist.current && (
                                        <div className="p-4 bg-[#181818]">
                                            <div className="px-2 mb-3 text-xs font-medium text-[#1DB954] tracking-wider uppercase">
                                                현재 재생 중
                                            </div>
                                            <div className="rounded-lg p-3 bg-[#282828]">
                                                <div className="font-medium mb-1">{categorizedPlaylist.current.title}</div>
                                                <div className="text-sm text-gray-400">
                                                    {formatTime(categorizedPlaylist.current.start)} ~ {formatTime(categorizedPlaylist.current.end)}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 대기 중인 항목들 */}
                                    {categorizedPlaylist.upcoming.length > 0 && (
                                        <div className="p-4 bg-[#121212]">
                                            <div className="px-2 mb-3 text-xs font-medium text-gray-400 tracking-wider uppercase">
                                                대기열
                                            </div>
                                            <div className="space-y-2">
                                                {categorizedPlaylist.upcoming.map((clip, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="group rounded-lg hover:bg-[#282828] transition-colors"
                                                    >
                                                        <div className="p-3 flex items-center gap-3">
                                                            <div
                                                                onClick={() => playAt(currentIndex + 1 + idx)}
                                                                className="flex-1 cursor-pointer"
                                                            >
                                                                <div className="font-medium mb-1 truncate">{clip.title}</div>
                                                                <div className="text-sm text-gray-400">
                                                                    {formatTime(clip.start)} ~ {formatTime(clip.end)}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleRemove(currentIndex + 1 + idx)}
                                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-white transition-all rounded-full hover:bg-[#383838]"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 이전 재생 항목들 */}
                                    {categorizedPlaylist.previous.length > 0 && (
                                        <div className="p-4 bg-[#121212]">
                                            <div className="px-2 mb-3 text-xs font-medium text-gray-400 tracking-wider uppercase">
                                                이전 재생
                                            </div>
                                            <div className="space-y-2">
                                                {categorizedPlaylist.previous.map((clip, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="group rounded-lg hover:bg-[#282828] transition-colors"
                                                    >
                                                        <div className="p-3 flex items-center gap-3">
                                                            <div
                                                                onClick={() => playAt(idx)}
                                                                className="flex-1 cursor-pointer"
                                                            >
                                                                <div className="font-medium mb-1 truncate text-gray-400">{clip.title}</div>
                                                                <div className="text-sm text-gray-500">
                                                                    {formatTime(clip.start)} ~ {formatTime(clip.end)}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleRemove(idx)}
                                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-white transition-all rounded-full hover:bg-[#383838]"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default PlaylistDrawer;
