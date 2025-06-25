import React from "react";

function SegmentCard({ data }) {
    const {
        title,
        start,
        end,
        summary,
        tags,
        music,
        story,
        ad,
    } = data;

    const timeRange = `${Math.floor(start / 60)}:${Math.floor(start % 60)
        .toString()
        .padStart(2, "0")} ~ ${Math.floor(end / 60)}:${Math.floor(end % 60)
            .toString()
            .padStart(2, "0")}`;

    return (
        <div className="bg-gray-800 p-4 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-1">{title}</h2>
            <p className="text-sm text-gray-400 mb-2">⏱ {timeRange}</p>
            <p className="mb-2">{summary}</p>
            <div className="mb-2">
                <strong>🎵 음악:</strong>{" "}
                {music.length > 0
                    ? music.map((m, idx) => (
                        <div key={idx}>
                            <em>{m.title}</em> - {m.artist} ({m.description})
                        </div>
                    ))
                    : "없음"}
            </div>
            <p><strong>✉️ 사연:</strong> {story}</p>
            <p><strong>📺 광고:</strong> {ad}</p>
            <div className="mt-2 text-sm text-blue-300">
                {tags.map((tag, idx) => (
                    <span key={idx} className="mr-2">#{tag}</span>
                ))}
            </div>
        </div>
    );
}

export default SegmentCard;
