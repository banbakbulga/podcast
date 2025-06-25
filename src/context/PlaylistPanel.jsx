import React from "react";
import { usePlaylist } from "../context/PlaylistContext";

function PlaylistPanel({ onClose }) {
    const { playlist, currentIndex, playAt } = usePlaylist();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 flex justify-center items-end">
            <div className="w-full max-w-md bg-gray-900 rounded-t-xl p-6 overflow-y-auto max-h-[70vh]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">🎶 재생목록</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">닫기 ✖</button>
                </div>

                {playlist.length === 0 ? (
                    <p className="text-gray-400">플레이리스트에 항목이 없습니다.</p>
                ) : (
                    <ul className="space-y-3">
                        {playlist.map((clip, idx) => (
                            <li
                                key={idx}
                                onClick={() => {
                                    playAt(idx);
                                    onClose();
                                }}
                                className={`p-3 rounded-lg cursor-pointer transition ${idx === currentIndex
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                                    }`}
                            >
                                <div className="font-semibold">{clip.title}</div>
                                <div className="text-sm text-gray-400">
                                    ⏱ {Math.floor(clip.start / 60)}:{String(Math.floor(clip.start % 60)).padStart(2, "0")} ~
                                    {Math.floor(clip.end / 60)}:{String(Math.floor(clip.end % 60)).padStart(2, "0")}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default PlaylistPanel;
