import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { checkAuth } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            const searchParams = new URLSearchParams(location.search);
            const code = searchParams.get('code');

            if (code) {
                try {
                    // 백엔드로 인증 코드 전송
                    const response = await axios.post('http://localhost:5001/auth/callback',
                        { code },
                        { withCredentials: true }
                    );

                    if (response.status === 200) {
                        await checkAuth(); // 사용자 정보 가져오기
                        navigate('/'); // 메인 페이지로 이동
                    }
                } catch (error) {
                    console.error('Authentication failed:', error);
                    navigate('/login'); // 로그인 페이지로 리다이렉트
                }
            } else {
                navigate('/login');
            }
        };

        handleCallback();
    }, [navigate, location, checkAuth]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-black via-gray-800 to-black">
            <div className="text-white text-center">
                <h2 className="text-2xl font-bold mb-4">로그인 처리 중...</h2>
                <p>잠시만 기다려주세요.</p>
            </div>
        </div>
    );
};

export default AuthCallback; 