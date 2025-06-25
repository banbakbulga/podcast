import React from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "./components/Navbar";

// 날짜별 상세 내용을 담은 샘플 데이터
const dateData = [
    {
        id: 1,
        date: "1992년 11월 7일(토요일)",
        content: `이 날 방송에서는 영화 이야기와 음악 코너가 진행되었습니다.
영화 A에 대한 소개와 함께, 감독 인터뷰가 포함되어 있습니다.`,
    },
    {
        id: 2,
        date: "1992년 11월 8일(일요일)",
        content: `일요일 특집으로 다양한 청취자 사연과 신청곡을 소개했습니다.
감성적인 영화 음악들이 주를 이루었습니다.`,
    },
    {
        id: 3,
        date: "1992년 11월 9일(월요일)",
        content: `월요일 아침을 여는 활기찬 방송이었습니다.
특별 게스트로 배우 B가 출연하여 작품 이야기를 들려주었습니다.`,
    },
    {
        id: 4,
        date: "1992년 11월 10일(화요일)",
        content: `화요일에는 주로 광고 속 추억을 떠올릴 수 있는 클립들이 소개되었습니다.
옛날 광고 음악과 함께 하는 추억 시간!`,
    },
];

function ReplayDetail() {
    const { id } = useParams();
    // URL 파라미터(:id)에 해당하는 날짜 정보 찾기
    const thisDate = dateData.find((d) => d.id === Number(id));

    if (!thisDate) {
        return (
            <div className="bg-gradient-to-b from-black via-gray-800 to-black text-white min-h-screen flex flex-col">
                <Navbar />
                <section className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
                    <h2 className="text-2xl font-bold mb-4">해당 날짜 정보를 찾을 수 없습니다.</h2>
                    <Link to="/replay" className="text-blue-400 underline">
                        날짜 목록으로 돌아가기
                    </Link>
                </section>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-black via-gray-800 to-black text-white min-h-screen flex flex-col">
            <Navbar />

            <section className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
                <h2 className="text-2xl font-bold mb-4">{thisDate.date}</h2>
                <p className="whitespace-pre-line">{thisDate.content}</p>

                <div className="mt-6">
                    <Link to="/replay" className="text-blue-400 underline">
                        ← 날짜 목록으로 돌아가기
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default ReplayDetail;
