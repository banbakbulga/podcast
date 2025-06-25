import React from 'react';
import { FaSpotify } from 'react-icons/fa';
import Navbar from "../components/Navbar";

const LoginPage = () => {
    const handleSpotifyLogin = () => {
        console.log("Spotify 로그인 시도 중...");
        const clientId = '076d3776c36e4bc8b4988d2a806cce8c';
        const redirectUri = 'http://localhost:5001/auth/callback';
        const scope = 'user-read-private user-read-email';
        const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&show_dialog=true`;
        console.log("리다이렉트 URL:", spotifyAuthUrl);
        window.location.href = spotifyAuthUrl;
    };

    return (
        <div className="bg-gradient-to-b from-black via-gray-800 to-black min-h-screen">
            <Navbar />
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="bg-gray-900 p-8 rounded-lg shadow-xl w-full max-w-md">
                    <h2 className="text-3xl font-bold text-center text-white mb-8">
                        로그인 / 회원가입
                    </h2>
                    <div className="space-y-4">
                        <button
                            onClick={handleSpotifyLogin}
                            className="w-full flex items-center justify-center gap-3 bg-[#1DB954] text-white py-3 px-4 rounded-full hover:bg-[#1ed760] transition-colors"
                        >
                            <FaSpotify className="text-2xl" />
                            <span className="font-semibold">Spotify로 시작하기</span>
                        </button>

                        <p className="text-gray-400 text-center text-sm mt-6">
                            Spotify 계정으로 로그인하거나 새로운 계정을 만들 수 있습니다.
                        </p>
                        <p className="text-gray-500 text-center text-xs">
                            계정이 없다면 자동으로 회원가입 페이지로 이동합니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage; 