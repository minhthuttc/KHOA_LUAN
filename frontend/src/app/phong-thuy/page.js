"use client";

import { useState } from "react";
import { Calendar, Clock, Sparkles } from "lucide-react";

export default function PhongThuyPage() {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [result, setResult] = useState(null);

  const calculateFengShui = () => {
    if (!birthDate) {
      alert("Vui lòng nhập ngày sinh!");
      return;
    }

    const date = new Date(birthDate);
    const year = date.getFullYear();
    
    // Tính mệnh theo năm sinh (đơn giản hóa)
    const yearMod = year % 10;
    let element = "";
    let elementColor = "";
    let luckyNumbers = [];
    let luckyColors = [];
    let direction = "";
    
    switch (yearMod) {
      case 0:
      case 1:
        element = "Kim";
        elementColor = "text-yellow-600";
        luckyNumbers = [4, 9];
        luckyColors = ["Trắng", "Vàng", "Nâu"];
        direction = "Tây, Tây Bắc";
        break;
      case 2:
      case 3:
        element = "Thủy";
        elementColor = "text-blue-600";
        luckyNumbers = [1, 6];
        luckyColors = ["Đen", "Xanh dương"];
        direction = "Bắc";
        break;
      case 4:
      case 5:
        element = "Hỏa";
        elementColor = "text-red-600";
        luckyNumbers = [2, 7];
        luckyColors = ["Đỏ", "Hồng", "Tím"];
        direction = "Nam";
        break;
      case 6:
      case 7:
        element = "Thổ";
        elementColor = "text-amber-700";
        luckyNumbers = [5, 0];
        luckyColors = ["Vàng", "Nâu", "Cam"];
        direction = "Trung tâm, Tây Nam, Đông Bắc";
        break;
      case 8:
      case 9:
        element = "Mộc";
        elementColor = "text-green-600";
        luckyNumbers = [3, 8];
        luckyColors = ["Xanh lá", "Xanh lơ"];
        direction = "Đông, Đông Nam";
        break;
    }

    // Phân tích giờ sinh nếu có
    let birthHourInfo = null;
    if (birthTime) {
      const hour = parseInt(birthTime.split(":")[0]);
      birthHourInfo = getBirthHourElement(hour);
    }

    setResult({
      element,
      elementColor,
      luckyNumbers,
      luckyColors,
      direction,
      year,
      birthHourInfo
    });
  };

  const getBirthHourElement = (hour) => {
    // Giờ Tý (23-01), Sửu (01-03), Dần (03-05), Mão (05-07), Thìn (07-09), Tỵ (09-11)
    // Ngọ (11-13), Mùi (13-15), Thân (15-17), Dậu (17-19), Tuất (19-21), Hợi (21-23)
    const hourMap = [
      { range: "23:00 - 01:00", name: "Giờ Tý", element: "Thủy", trait: "Thông minh, linh hoạt" },
      { range: "01:00 - 03:00", name: "Giờ Sửu", element: "Thổ", trait: "Chăm chỉ, kiên nhẫn" },
      { range: "03:00 - 05:00", name: "Giờ Dần", element: "Mộc", trait: "Dũng cảm, quyết đoán" },
      { range: "05:00 - 07:00", name: "Giờ Mão", element: "Mộc", trait: "Nhẹ nhàng, tinh tế" },
      { range: "07:00 - 09:00", name: "Giờ Thìn", element: "Thổ", trait: "Mạnh mẽ, tự tin" },
      { range: "09:00 - 11:00", name: "Giờ Tỵ", element: "Hỏa", trait: "Nhiệt huyết, năng động" },
      { range: "11:00 - 13:00", name: "Giờ Ngọ", element: "Hỏa", trait: "Sáng tạo, lạc quan" },
      { range: "13:00 - 15:00", name: "Giờ Mùi", element: "Thổ", trait: "Hiền lành, chu đáo" },
      { range: "15:00 - 17:00", name: "Giờ Thân", element: "Kim", trait: "Thông minh, nhanh nhẹn" },
      { range: "17:00 - 19:00", name: "Giờ Dậu", element: "Kim", trait: "Cẩn thận, tỉ mỉ" },
      { range: "19:00 - 21:00", name: "Giờ Tuất", element: "Thổ", trait: "Trung thành, đáng tin" },
      { range: "21:00 - 23:00", name: "Giờ Hợi", element: "Thủy", trait: "Hòa đồng, dễ gần" }
    ];

    if (hour >= 23 || hour < 1) return hourMap[0];
    if (hour >= 1 && hour < 3) return hourMap[1];
    if (hour >= 3 && hour < 5) return hourMap[2];
    if (hour >= 5 && hour < 7) return hourMap[3];
    if (hour >= 7 && hour < 9) return hourMap[4];
    if (hour >= 9 && hour < 11) return hourMap[5];
    if (hour >= 11 && hour < 13) return hourMap[6];
    if (hour >= 13 && hour < 15) return hourMap[7];
    if (hour >= 15 && hour < 17) return hourMap[8];
    if (hour >= 17 && hour < 19) return hourMap[9];
    if (hour >= 19 && hour < 21) return hourMap[10];
    return hourMap[11];
  };

  const handleReset = () => {
    setBirthDate("");
    setBirthTime("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-dark dark:via-dark-lighter dark:to-dark py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold dark:text-white">
              Xem Phong Thủy
            </h1>
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Khám phá mệnh ngũ hành và con số may mắn của bạn
          </p>
        </div>

        {/* Form Input */}
        <div className="bg-white dark:bg-dark-lighter rounded-2xl shadow-xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="space-y-6">
            {/* Ngày sinh */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-3 dark:text-gray-200">
                <Calendar className="w-5 h-5 text-primary" />
                Ngày tháng năm sinh
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-white dark:bg-dark border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Giờ sinh */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-3 dark:text-gray-200">
                <Clock className="w-5 h-5 text-primary" />
                Giờ sinh (không bắt buộc)
              </label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full bg-white dark:bg-dark border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Nhập giờ sinh để xem phân tích chi tiết hơn
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleReset}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Đặt lại
              </button>
              <button
                onClick={calculateFengShui}
                className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-semibold transition shadow-lg shadow-primary/30"
              >
                Xem Phong Thủy
              </button>
            </div>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white dark:bg-dark-lighter rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">
              Kết Quả Phong Thủy
            </h2>

            <div className="space-y-6">
              {/* Mệnh */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 dark:text-white">Mệnh Ngũ Hành</h3>
                <p className="text-3xl font-bold mb-2">
                  <span className={result.elementColor}>Mệnh {result.element}</span>
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Năm sinh: {result.year}
                </p>
              </div>

              {/* Giờ sinh */}
              {result.birthHourInfo && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-3 dark:text-white">Giờ Sinh</h3>
                  <p className="text-xl font-bold mb-2 text-blue-600 dark:text-blue-400">
                    {result.birthHourInfo.name} ({result.birthHourInfo.range})
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-1">
                    <span className="font-semibold">Hành:</span> {result.birthHourInfo.element}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Tính cách:</span> {result.birthHourInfo.trait}
                  </p>
                </div>
              )}

              {/* Con số may mắn */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 dark:text-white">Con Số May Mắn</h3>
                <div className="flex gap-4">
                  {result.luckyNumbers.map((num) => (
                    <div
                      key={num}
                      className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg"
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              {/* Màu sắc may mắn */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 dark:text-white">Màu Sắc May Mắn</h3>
                <div className="flex flex-wrap gap-3">
                  {result.luckyColors.map((color) => (
                    <span
                      key={color}
                      className="px-4 py-2 bg-white dark:bg-gray-600 rounded-full text-gray-700 dark:text-gray-200 font-medium shadow"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hướng may mắn */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 dark:text-white">Hướng May Mắn</h3>
                <p className="text-xl font-semibold text-amber-700 dark:text-amber-400">
                  {result.direction}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
