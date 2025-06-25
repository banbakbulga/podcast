import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await axios.get('http://localhost:5001/auth/me', {
                withCredentials: true
            });
            setUser(response.data);
            return response.data;
        } catch (error) {
            console.error('인증 확인 실패:', error);
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:5001/auth/logout', {}, {
                withCredentials: true
            });
            setUser(null);
            window.location.href = '/login';
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    };

    // 로그인 여부 확인
    const isAuthenticated = () => {
        return !!user;
    };

    // 보호된 라우트를 위한 함수
    const requireAuth = (navigate) => {
        if (!isAuthenticated() && !loading) {
            navigate('/login');
            return false;
        }
        return true;
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            checkAuth,
            logout,
            isAuthenticated,
            requireAuth
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};