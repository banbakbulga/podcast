import React, { useState } from 'react';

function PlaylistModal({ playlists, onAdd, onClose }) {
    const [selectedId, setSelectedId] = useState(null);
    const [newName, setNewName] = useState('');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-xs relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="text-lg font-bold text-white mb-4">플레이리스트에 추가</h2>
                <div className="mb-4">
                    <div className="mb-2 text-sm text-gray-300">내 플레이리스트</div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {playlists.length === 0 && <div className="text-xs text-gray-500">플레이리스트가 없습니다.</div>}
                        {playlists.map(pl => (
                            <label key={pl._id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="playlist"
                                    checked={selectedId === pl._id}
                                    onChange={() => setSelectedId(pl._id)}
                                />
                                <span className="text-gray-200">{pl.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="mb-4">
                    <div className="mb-2 text-sm text-gray-300">새 플레이리스트 만들기</div>
                    <input
                        type="text"
                        className="w-full px-3 py-2 rounded bg-gray-800 text-white focus:outline-none"
                        placeholder="플레이리스트 이름"
                        value={newName}
                        onChange={e => { setNewName(e.target.value); setSelectedId(null); }}
                    />
                </div>
                <button
                    className="w-full py-2 rounded bg-blue-500 hover:bg-blue-400 text-white font-semibold mt-2 disabled:opacity-50"
                    disabled={!selectedId && !newName.trim()}
                    onClick={() => {
                        if (selectedId) onAdd(selectedId);
                        else if (newName.trim()) onAdd(null, newName.trim());
                    }}
                >
                    추가하기
                </button>
            </div>
        </div>
    );
}

export default PlaylistModal; 