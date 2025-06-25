import React from 'react';

function PlayerInfo({ title, artist, albumInfo }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm overflow-hidden bg-zinc-800 flex items-center justify-center">
                {albumInfo?.image ? (
                    <a
                        href={albumInfo.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-full"
                    >
                        <img
                            src={albumInfo.image}
                            alt="Album Art"
                            className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                        />
                    </a>
                ) : (
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                )}
            </div>
            <div className="flex flex-col justify-center overflow-hidden">
                <div className="text-sm font-medium truncate max-w-[200px]">{title}</div>
                <div className="text-xs text-gray-400 truncate max-w-[200px]">{artist}</div>
            </div>
        </div>
    );
}

export default PlayerInfo;
