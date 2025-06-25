import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MovieInfo = ({ movieTitle }) => {
    const [movieData, setMovieData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMovieData = async () => {
            if (!movieTitle) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await axios.get('http://www.omdbapi.com/', {
                    params: {
                        t: movieTitle,
                        apikey: process.env.REACT_APP_OMDB_API_KEY,
                        plot: 'short'
                    }
                });
                if (response.data.Response === "True") {
                    setMovieData(response.data);
                } else {
                    setError("영화 정보를 찾을 수 없습니다.");
                }
            } catch (err) {
                setError("영화 정보를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchMovieData();
    }, [movieTitle]);

    if (!movieTitle) return null;
    if (loading) {
        return (
            <div className="bg-gray-800 rounded-lg shadow p-2 flex items-center min-h-[64px] min-w-[220px] max-w-[340px] animate-pulse">
                <div className="w-12 h-16 bg-gray-700 rounded mr-3" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-700 rounded w-1/2" />
                </div>
            </div>
        );
    }
    if (error || !movieData) {
        return (
            <div className="bg-gray-800 rounded-lg shadow p-2 flex items-center min-h-[64px] min-w-[220px] max-w-[340px]">
                <div className="w-12 h-16 bg-gray-700 rounded mr-3 flex items-center justify-center">
                    <span className="text-2xl">🎬</span>
                </div>
                <div className="flex-1">
                    <span className="font-bold text-base text-white truncate">{movieTitle}</span>
                    <div className="text-xs text-gray-400">{error || '영화 정보를 찾을 수 없습니다.'}</div>
                </div>
            </div>
        );
    }
    return (
        <div className="bg-yellow-900/90 border-2 border-yellow-400 shadow-lg p-2 flex items-center min-h-[64px] min-w-[220px] max-w-[340px] rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-2xl">
            {movieData.Poster && movieData.Poster !== "N/A" ? (
                <img
                    src={movieData.Poster}
                    alt={`${movieData.Title} 포스터`}
                    className="w-12 h-16 object-cover rounded mr-3 flex-shrink-0 border border-yellow-300"
                    onError={e => { e.target.style.display = 'none'; }}
                />
            ) : (
                <div className="w-12 h-16 bg-yellow-800 rounded mr-3 flex items-center justify-center border border-yellow-300">
                    <span className="text-2xl">🎬</span>
                </div>
            )}
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white truncate max-w-[120px]">{movieData.Title}</span>
                    {movieData.imdbRating !== "N/A" && (
                        <span className="text-yellow-300 text-xs font-bold">★ {movieData.imdbRating}</span>
                    )}
                    <span className="text-xs text-yellow-200">{movieData.Year}</span>
                </div>
                <div className="text-xs text-yellow-100 truncate">감독: {movieData.Director}</div>
                <div className="text-xs text-yellow-100 truncate">출연: {movieData.Actors.split(', ').slice(0, 2).join(', ')}{movieData.Actors.split(', ').length > 2 && '...'}</div>
                <div className="text-xs text-yellow-200 mt-0.5 line-clamp-2">{movieData.Plot}</div>
            </div>
        </div>
    );
};

export default MovieInfo; 