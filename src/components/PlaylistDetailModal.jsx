import React from 'react';

function PlaylistDetailModal({ playlist, onClose, onPlay, onRemoveClip }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="text-xl font-bold text-white mb-4">{playlist.name}</h2>
                {playlist.clips.length === 0 ? (
                    <div className="text-gray-400">클립이 없습니다.</div>
                ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {playlist.clips.map(clip => (
                            <div key={clip.id} className="flex items-center gap-3 bg-gray-800/60 rounded-lg p-3">
                                <div className="flex-1 min-w-0">
                                    <div className="text-white font-medium truncate">{clip.title}</div>
                                    <div className="text-xs text-gray-400">{clip.displayDate}</div>
                                </div>
                                <button
                                    className="p-1.5 rounded-full text-green-400 hover:text-green-300 transition-colors"
                                    title="재생"
                                    onClick={() => onPlay(clip)}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                        <polygon points="10,8 16,12 10,16" fill="currentColor" />
                                    </svg>
                                </button>
                                <button
                                    className="p-1.5 rounded-full text-red-400 hover:text-red-300 transition-colors"
                                    title="삭제"
                                    onClick={() => onRemoveClip(clip.id)}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
                                        <line x1="6" y1="18" x2="18" y2="6" strokeWidth="2" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PlaylistDetailModal; 