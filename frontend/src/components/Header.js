"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { User, LogOut } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user từ localStorage khi component mount
    const loadUser = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    };

    loadUser();

    // Lắng nghe sự kiện storage để cập nhật khi localStorage thay đổi
    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-dark border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-3">
            <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Circle outline */}
              <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="6" fill="none" className="text-primary"/>
              
              {/* SIM card with cut corner */}
              <path d="M30 25 L30 75 L70 75 L70 40 L55 25 Z" fill="currentColor" className="text-primary"/>
              
              {/* Chip pattern (white rectangles) */}
              <rect x="38" y="48" width="8" height="8" fill="white"/>
              <rect x="48" y="48" width="8" height="8" fill="white"/>
              <rect x="58" y="48" width="8" height="8" fill="white"/>
              <rect x="38" y="58" width="8" height="8" fill="white"/>
              <rect x="48" y="58" width="8" height="8" fill="white"/>
              <rect x="58" y="58" width="8" height="8" fill="white"/>
            </svg>
            <span className="font-bold text-2xl tracking-tight">MINHTHUSIM</span>
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="font-medium hover:text-primary transition-colors">Trang chủ</Link>
            <Link href="/kho-so" className="font-medium hover:text-primary transition-colors">Kho số</Link>
            <Link href="/phong-thuy" className="font-medium hover:text-primary transition-colors">Xem Phong Thủy</Link>
            <a href="#" className="font-medium hover:text-primary transition-colors">Liên hệ</a>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-full border-2 border-blue-200 dark:border-gray-600">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-white">{user.name}</span>
                </div>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full font-medium transition"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-medium transition"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="font-medium hover:text-primary transition-colors px-4 py-2"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-full font-medium transition-transform transform hover:scale-105 shadow-lg shadow-primary/30"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
