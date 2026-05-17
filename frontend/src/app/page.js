"use client";

import { useState } from "react";
import axios from "axios";
import { Search, Loader2 } from "lucide-react";
import SimCard from "@/components/SimCard";

export default function Home() {
  const [formData, setFormData] = useState({
    birthDate: "",
    luckyNumbers: "",
    priceLimit: 5000000,
    expectedNetwork: "",
    purpose: "",
  });

  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    
    // Scroll xuống phần kết quả
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    
    try {
      const payload = {
        ...formData,
        luckyNumbers: formData.luckyNumbers
          ? formData.luckyNumbers.split(",").map((n) => n.trim())
          : [],
      };

      const res = await axios.post("http://localhost:5000/api/recommend", payload);
      if (res.data.success) {
        setRecommendations(res.data.data);
        
        // Lưu lịch sử phân tích nhu cầu
        try {
          const userData = localStorage.getItem("user");
          if (userData) {
            const user = JSON.parse(userData);
            await axios.post("http://localhost:5000/api/recommendation-history", {
              user_id: user.id,
              user_name: user.name,
              birth_date: formData.birthDate || null,
              lucky_numbers: formData.luckyNumbers || null,
              price_limit: formData.priceLimit,
              expected_network: formData.expectedNetwork || null,
              purpose: formData.purpose || null,
              result_count: res.data.data.length
            });
          }
        } catch (historyError) {
          console.error("Error saving recommendation history:", historyError);
          // Không hiển thị lỗi cho user
        }
      }
    } catch (err) {
      console.error("Error fetching AI recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatPrice = (p) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 lg:py-32">
        {/* Animated background effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-yellow-500/30 to-amber-600/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-yellow-600/20 to-orange-500/20 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-full blur-[80px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              TÌM KIẾM <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 bg-clip-text text-transparent">SIM SỐ ĐẸP</span> BẰNG AI
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl font-light leading-relaxed">
              Nhập ngày sinh, sở thích và mục đích sử dụng. AI sẽ phân tích ngũ hành, tổng nút và gợi ý chiếc SIM phù hợp nhất với bạn.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-yellow-500/20 p-6 md:p-8 rounded-3xl shadow-2xl shadow-yellow-500/10 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              <Search className="text-primary" /> Phân tích nhu cầu
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Ngày sinh (YYYY-MM-DD)</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full bg-dark-lighter border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Con số yêu thích (Cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  name="luckyNumbers"
                  placeholder="Vd: 39, 79, 68"
                  value={formData.luckyNumbers}
                  onChange={handleChange}
                  className="w-full bg-dark-lighter border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Mục đích sử dụng sim</label>
                <textarea
                  rows="3"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="Ví dụ: Kinh doanh, cá nhân, muốn số đẹp mang lại may mắn..."
                  className="w-full bg-dark-lighter border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nhà mạng mong muốn</label>
                  <select
                    name="expectedNetwork"
                    value={formData.expectedNetwork}
                    onChange={handleChange}
                    className="w-full bg-dark-lighter border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition appearance-none"
                  >
                    <option value="">Tất cả nhà mạng</option>
                    <option value="Viettel">Viettel</option>
                    <option value="Vinaphone">Vinaphone</option>
                    <option value="Mobifone">Mobifone</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Ngân sách tối đa: <span className="text-primary font-bold">{formatPrice(formData.priceLimit)}</span>
                  </label>
                  <input
                    type="range"
                    name="priceLimit"
                    min="500000"
                    max="5000000"
                    step="500000"
                    value={formData.priceLimit}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary mt-3"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-dark font-bold text-lg py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] flex justify-center items-center gap-2 mt-4"
              >
                {loading ? <Loader2 className="animate-spin" /> : "AI phân tích"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section id="results" className="py-20 bg-gray-50 dark:bg-dark min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold dark:text-white mb-4">
              {searched ? "Kết quả phân tích từ AI" : "Các sim nổi bật"}
            </h2>
            {searched && recommendations.length > 0 && (
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Dựa trên thuật toán AI Scoring, đây là những chiếc sim tối ưu nhất dành riêng cho bạn. Điểm Suitability (S) càng cao, sim càng hợp.
              </p>
            )}
          </div>

          {!searched && (
             <div className="text-center text-gray-500 py-12">
               Hãy điền thông tin để bắt đầu trải nghiệm AI Recommendation.
             </div>
          )}

          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">AI đang tính toán điểm số ngũ hành, sở thích...</p>
             </div>
          ) : searched && recommendations.length === 0 ? (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400">
              Không tìm thấy sim nào phù hợp với các tiêu chí này. Hãy thử nới rộng ngân sách hoặc đổi nhà mạng!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {recommendations.map((sim) => (
                <SimCard key={sim.id} sim={sim} />
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
