"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { LogIn, User, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/login", formData);

      if (res.data.success) {
        // Lưu thông tin user vào localStorage
        localStorage.setItem("user", JSON.stringify(res.data.user));
        
        // Trigger storage event để Header cập nhật
        window.dispatchEvent(new Event("storage"));
        
        // Chuyển hướng dựa trên role
        if (res.data.user.role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-dark dark:via-dark-lighter dark:to-dark flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <LogIn className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold dark:text-white mb-2">Đăng Nhập</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Chào mừng bạn quay trở lại
          </p>
        </div>

        <div className="bg-white dark:bg-dark-lighter rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 dark:text-gray-200">
                <User className="w-4 h-4" />
                Tên đăng nhập
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-white dark:bg-dark border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                placeholder="Nhập tên đăng nhập"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 dark:text-gray-200">
                <Lock className="w-4 h-4" />
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-white dark:bg-dark border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-semibold transition shadow-lg shadow-primary/30 disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đăng Nhập"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-gray-600 dark:text-gray-400">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-primary hover:underline font-semibold">
                Đăng ký ngay
              </Link>
            </p>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tài khoản admin demo:<br />
                <span className="font-mono">Admin / admin123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
