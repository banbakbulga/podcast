import React from "react";
import Navbar from "./components/Navbar";
import { Link } from "react-router-dom";

// 샘플 데이터: 에피소드(조각) 날짜, 요일, 제목, 조회수, 고유 id
const episodes = [
    {
        id: 1,
        date: "2025-03-19",
        day: "수요일",
        title: "2025년 3월 19일 수요일",
        views: 11,
    },
    {
        id: 2,
        date: "2025-03-18",
        day: "화요일",
        title: "2025년 3월 18일 화요일",
        views: 22,
    },
    {
        id: 3,
        date: "2025-03-17",
        day: "월요일",
        title: "2025년 3월 17일 월요일",
        views: 21,
    },
    {
        id: 4,
        date: "2025-03-16",
        day: "일요일",
        title: "2025년 3월 16일 일요일",
        views: 19,
    },
    {
        id: 5,
        date: "2025-03-15",
        day: "토요일",
        title: "2025년 3월 15일 토요일",
        views: 22,
    },
    {
        id: 6,
        date: "2025-03-14",
        day: "금요일",
        title: "2025년 3월 14일 금요일",
        views: 18,
    },
];

function PlaylistPage() {
    return (
        <div className="bg-gradient-to-b from-black via-gray-800 to-black text-white min-h-screen flex flex-col">
            <Navbar />

            <section className="px-4 py-8 flex-1 max-w-4xl mx-auto w-full">
                <h1 className="text-3xl font-bold mb-6">다시보기 선곡표</h1>

                {/* 테이블 영역 */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-700">
                                <th className="p-3">에피소드 (날짜)</th>
                                <th className="p-3">조각 제목</th>
                                <th className="p-3">조회수</th>
                            </tr>
                        </thead>
                        <tbody>
                            {episodes.map((episode) => (
                                <tr key={episode.id} className="border-b border-gray-600">
                                    <td className="p-3">
                                        {episode.date} ({episode.day})
                                    </td>
                                    <td className="p-3 text-blue-400 underline">
                                        {/* 제목 클릭 시 상세 페이지로 이동 */}
                                        <Link to={`/playlist/${episode.id}`}>
                                            {episode.title}
                                        </Link>
                                    </td>
                                    <td className="p-3">{episode.views}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

export default PlaylistPage;
