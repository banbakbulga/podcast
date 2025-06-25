import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 📁 페이지들
import MainPage from "./pages/MainPage";
import ReplayPage from "./pages/ReplayPage";
import ReplayDetail from "./pages/ReplayDetail";
import LoginPage from "./pages/LoginPage";
import AuthCallback from "./pages/AuthCallback";
import CategoryPage from "./pages/CategoryPage";
import MyPage from "./pages/MyPage";

// 📁 context 및 플레이어 바
import { PlaylistProvider } from "./context/PlaylistContext";
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";

function App() {
  return (
    <AuthProvider>
      <PlaylistProvider>
        <FavoritesProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/" element={<MainPage />} />
              <Route path="/replay" element={<ReplayPage />} />
              <Route path="/replay/:id" element={<ReplayDetail />} />
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              <Route path="/mypage" element={<MyPage />} />
            </Routes>
          </BrowserRouter>
        </FavoritesProvider>
      </PlaylistProvider>
    </AuthProvider>
  );
}

export default App;
