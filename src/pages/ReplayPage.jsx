import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const dateList = [
    {
        "id": 1,
        "date": "1992년 11월 4일(수요일)",
        "theme": "프랑스 영화음악 특집: 'La Boum'과 'Wings of Desire'",
        "summary": "프랑스 영화의 음악적 매력을 소개하는 특집 방송. 'La Boum'의 감성적인 OST와 'Wings of Desire'의 몽환적인 사운드트랙을 중심으로, 프랑스 영화음악의 독특한 분위기와 감성을 전달합니다. 청취자들의 프랑스 영화 음악 관련 추억과 사연도 함께 소개됩니다."
    },
    {
        "id": 2,
        "date": "1992년 11월 7일(토요일)",
        "theme": "스파이크 리 감독의 영화음악: 'Do the Right Thing'과 'Mo' Better Blues'",
        "summary": "스파이크 리 감독의 대표작들을 통해 재즈와 힙합이 어우러진 현대적 영화음악의 세계를 탐구합니다. 'Do the Right Thing'의 Public Enemy의 음악과 'Mo' Better Blues'의 재즈 사운드트랙을 중심으로, 영화 속 음악이 사회적 메시지를 전달하는 방식을 살펴봅니다."
    },
    {
        "id": 3,
        "date": "1992년 11월 8일(일요일)",
        "theme": "아시아 영화음악 특집: 'A Brighter Summer Day'와 'Apocalypse Now'",
        "summary": "아시아 영화의 음악적 특징과 서양 영화에서 아시아 음악을 활용한 사례를 다룹니다. 양만위 감독의 'A Brighter Summer Day'의 60년대 대만 음악과 'Apocalypse Now'에서 사용된 와그너의 음악을 통해 동서양 음악의 조화를 살펴봅니다."
    },
    {
        "id": 4,
        "date": "1992년 11월 10일(월요일)",
        "theme": "이브 몽땅 특집: 그의 영화와 음악 인생",
        "summary": "프랑스 영화계의 전설 이브 몽땅의 예술 인생을 그의 영화와 음악을 통해 조명합니다. 'Far and Away'의 서정적인 OST부터 'IP5'의 현대적인 사운드트랙까지, 그의 다양한 연기 스타일과 함께 음악적 여정을 추적합니다. 특히 그의 정치적 신념이 반영된 영화 음악들도 소개됩니다."
    },
    {
        "id": 5,
        "date": "1992년 11월 11일(수요일)",
        "theme": "80년대 영화음악의 황금기: 'The Rose'부터 'Flashdance'까지",
        "summary": "1980년대를 대표하는 영화음악들을 소개합니다. 'The Rose'의 Bette Midler의 파워풀한 보컬부터 'Flashdance'의 전자음악까지, 80년대 영화음악의 다양성과 혁신을 살펴봅니다. 특히 'Top Gun'의 Kenny Loggins의 'Danger Zone'과 같은 시대를 대표하는 명곡들도 함께 소개됩니다."
    },
    {
        "id": 6,
        "date": "1992년 11월 12일(목요일)",
        "theme": "영화음악의 철학: 소리와 이미지의 조화",
        "summary": "영화음악의 본질과 철학적 의미를 탐구합니다. 영화에서 음악이 어떻게 시각적 이미지와 결합하여 새로운 의미를 만들어내는지, 그리고 그것이 관객의 감정에 어떤 영향을 미치는지에 대해 깊이 있게 다룹니다. 다양한 영화 사례를 통해 영화음악의 예술적 가치를 재조명합니다."
    },
    {
        "id": 7,
        "date": "1992년 11월 13일(금요일)",
        "theme": "클래식 영화음악의 재발견",
        "summary": "클래식 영화의 음악적 가치를 재조명하는 특집 방송. 오케스트라 음악이 주를 이루던 클래식 영화음악의 특징과 현대 영화음악과의 차이점을 살펴봅니다. 특히 Max Steiner, Bernard Herrmann 등 클래식 영화음악 작곡가들의 작품 세계를 소개합니다."
    },
    {
        "id": 8,
        "date": "1992년 11월 16일(월요일)",
        "theme": "영화음악의 감정 전달: 테마곡의 힘",
        "summary": "영화음악이 어떻게 감정을 전달하고 이야기를 풀어나가는지에 대해 다룹니다. 'Star Wars'의 John Williams의 테마곡부터 'The Godfather'의 Nino Rota의 음악까지, 영화음악이 만들어내는 감동의 순간들을 분석하고 소개합니다."
    },
    {
        "id": 9,
        "date": "1992년 11월 17일(화요일)",
        "theme": "알란 파커 감독의 음악적 영화세계",
        "summary": "알란 파커 감독의 영화에서 음악이 차지하는 특별한 의미를 살펴봅니다. 'Fame'의 뮤지컬 넘버부터 'The Commitments'의 소울 음악까지, 그의 영화에서 음악이 어떻게 내러티브의 중심이 되는지 분석합니다. 특히 'Pink Floyd The Wall'의 음악적 실험성도 함께 다룹니다."
    },
    {
        "id": 10,
        "date": "1992년 11월 18일(수요일)",
        "theme": "뮤지컬 영화의 음악적 매력",
        "summary": "뮤지컬 영화의 음악적 특징과 매력을 소개합니다. 'A Star is Born'의 감성적인 발라드부터 'Fame'의 에너지 넘치는 댄스 넘버까지, 뮤지컬 영화가 보여주는 다양한 음악적 스펙트럼을 살펴봅니다. 특히 뮤지컬 영화에서 음악이 어떻게 스토리텔링의 도구로 활용되는지 분석합니다."
    },
    {
        "id": 11,
        "date": "1992년 11월 19일(목요일)",
        "theme": "영화 기법과 음악의 관계: 롱테이크의 음악적 효과",
        "summary": "영화의 기술적 기법과 음악의 상호작용을 분석합니다. 특히 롱테이크 기법에서 음악이 어떻게 시간의 흐름을 조절하고 감정을 고조시키는지, 'Touch of Evil'과 'Goodfellas'의 사례를 통해 살펴봅니다. 영화음악의 리듬과 영상의 리듬이 만나는 순간들을 소개합니다."
    },
    {
        "id": 12,
        "date": "1993년 1월 1일(금요일)",
        "theme": "1993년 신년 특집: 영화음악의 새로운 시작",
        "summary": "새해를 맞아 영화음악의 새로운 트렌드와 가능성을 전망합니다. 1993년 개봉 예정 영화들의 음악적 특징과 함께, 영화음악의 미래를 예측합니다. 청취자들의 새해 영화음악 소망과 함께, 과거의 명작 영화음악도 함께 회상합니다."
    },
    {
        "id": 13,
        "date": "1993년 1월 2일(토요일)",
        "theme": "주말 특집: 영화음악의 명장면",
        "summary": "영화사에 길이 남을 명장면과 그를 더욱 빛나게 한 음악들을 소개합니다. 'The Godfather'의 세례식 장면부터 'Psycho'의 샤워 장면까지, 영화음악이 만들어낸 불멸의 순간들을 재조명합니다. 특히 영화음악이 어떻게 장면의 긴장감과 감동을 극대화하는지 분석합니다."
    },
    {
        "id": 14,
        "date": "1993년 2월 1일(월요일)",
        "theme": "",
        "summary": ""
    },
    {
        "id": 15,
        "date": "1993년 3월 1일(월요일)",
        "theme": "",
        "summary": ""
    }
];

function ReplayPage() {
    const [hoveredId, setHoveredId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");

    // Extract unique years and months from dateList
    const years = useMemo(() => {
        const uniqueYears = new Set(dateList.map(item => item.date.split("년")[0]));
        return Array.from(uniqueYears).sort();
    }, []);

    const months = useMemo(() => {
        const uniqueMonths = new Set(dateList.map(item => {
            const month = item.date.split("년")[1].split("월")[0].trim();
            return month;
        }));
        return Array.from(uniqueMonths).sort((a, b) => parseInt(a) - parseInt(b));
    }, []);

    // Filter dateList based on search query and selected year/month
    const filteredList = useMemo(() => {
        return dateList.filter(item => {
            const matchesSearch = searchQuery === "" ||
                item.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.summary.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesYear = selectedYear === "" ||
                item.date.startsWith(selectedYear + "년");

            const matchesMonth = selectedMonth === "" ||
                item.date.includes(selectedYear + "년 " + selectedMonth + "월");

            return matchesSearch && matchesYear && matchesMonth;
        });
    }, [searchQuery, selectedYear, selectedMonth]);

    return (
        <div className="bg-gradient-to-b from-black via-gray-900 to-black text-white min-h-screen">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-transparent bg-clip-text">
                        📻 다시 듣기
                    </h1>
                    <p className="text-gray-400 text-lg">
                        FM 영화음악 방송을 다시 들어보세요
                    </p>
                </div>

                {/* Search and Filter Section */}
                <div className="mb-8 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="테마나 요약 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-yellow-400 focus:outline-none"
                        />
                        <div className="flex gap-4">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-yellow-400 focus:outline-none"
                            >
                                <option value="">전체 연도</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}년</option>
                                ))}
                            </select>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-yellow-400 focus:outline-none"
                                disabled={!selectedYear}
                            >
                                <option value="">전체 월</option>
                                {months.map(month => (
                                    <option key={month} value={month}>{month}월</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {filteredList.length === 0 && (
                        <p className="text-gray-400 text-center">
                            검색 결과가 없습니다.
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredList.map((item) => (
                        <Link
                            key={item.id}
                            to={`/replay/${item.id}`}
                            className="block"
                            onMouseEnter={() => setHoveredId(item.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            <div className={`bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 
                                ${hoveredId === item.id ? 'transform scale-105 shadow-2xl ring-2 ring-yellow-400' : 'hover:shadow-xl'}`}>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-semibold text-yellow-400">
                                            {item.date}
                                        </h2>
                                        <span className="text-gray-400 text-sm">
                                            #{item.id}
                                        </span>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-lg font-medium text-blue-400 mb-2">
                                            🎬 테마
                                        </h3>
                                        <p className="text-gray-300">
                                            {item.theme}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium text-blue-400 mb-2">
                                            📝 요약
                                        </h3>
                                        <p className="text-gray-300 line-clamp-3">
                                            {item.summary}
                                        </p>
                                    </div>
                                </div>

                                <div className={`bg-gray-700 px-6 py-4 transition-all duration-300
                                    ${hoveredId === item.id ? 'bg-yellow-500/10' : ''}`}>
                                    <button className="text-yellow-400 font-medium hover:text-yellow-300 transition-colors duration-300">
                                        자세히 보기 →
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ReplayPage;
