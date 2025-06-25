import React from "react";

function PlayerProgress({ progress, onSeek }) {
    return (
        <div
            className="w-full h-1.5 bg-zinc-700 mt-3 rounded-full cursor-pointer"
            onClick={onSeek}
        >
            <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    );
}

export default PlayerProgress;
