import React, { useEffect, useState } from "react";

function SpotifyTrackCard({ title, artist, description }) {
    const [track, setTrack] = useState(null);

    useEffect(() => {
        fetch(`/api/spotify?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`)
            .then((res) => res.json())
            .then((data) => {
                if (!data.error) setTrack(data);
            })
            .catch(console.error);
    }, [title, artist]);

    if (!track) {
        return (
            <div className="text-sm bg-gray-700 p-2 rounded mb-2">
                <p><strong>{title}</strong> - {artist}</p>
                <p className="text-xs">{description}</p>
            </div>
        );
    }

    return (
        <div className="flex items-center bg-gray-700 rounded-lg p-3 mb-3 shadow">
            <img src={track.album_image} alt="Album" className="w-16 h-16 rounded mr-4" />
            <div>
                <p className="font-bold">{track.title}</p>
                <p className="text-sm text-gray-300">{track.artist}</p>
                <p className="text-sm mt-1">{description}</p>
                <div className="flex space-x-2 mt-2">
                    {track.preview_url && (
                        <audio controls src={track.preview_url} className="w-36" />
                    )}
                    <a
                        href={track.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 text-sm underline"
                    >
                        Spotify로 보기 →
                    </a>
                </div>
            </div>
        </div>
    );
}

export default SpotifyTrackCard;
