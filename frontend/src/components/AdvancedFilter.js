import { Filter, X } from "lucide-react";
import { useState } from "react";

export default function AdvancedFilter({ onFilterChange, onClose }) {
  const [filters, setFilters] = useState({
    network: [],
    simType: [],
    minPrice: 0,
    maxPrice: 50000000,
    specialNumbers: "",
    anniversaryDate: "",
  });

  const networks = ["Viettel", "Vinaphone", "Mobifone"];
  const simTypes = [
    { value: "tam-hoa", label: "Sim Tam Hoa" },
    { value: "tu-quy", label: "Sim Tứ Quý" },
    { value: "than-tai", label: "Sim Thần Tài" },
    { value: "loc-phat", label: "Sim Lộc Phát" },
  ];

  const handleCheckbox = (category, value) => {
    setFilters((prev) => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      network: [],
      simType: [],
      minPrice: 0,
      maxPrice: 50000000,
      specialNumbers: "",
      anniversaryDate: "",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <div className="bg-white dark:bg-dark-lighter rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
          <Filter className="text-primary" />
          Bộ lọc thông minh
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Nhà mạng */}
        <div>
          <label className="block text-sm font-semibold mb-3 dark:text-gray-200">
            Nhà mạng
          </label>
          <div className="flex flex-wrap gap-2">
            {networks.map((network) => (
              <button
                key={network}
                onClick={() => handleCheckbox("network", network)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  filters.network.includes(network)
                    ? "bg-primary text-white border-primary"
                    : "bg-white dark:bg-dark border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary"
                }`}
              >
                {network}
              </button>
            ))}
          </div>
        </div>

        {/* Loại sim */}
        <div>
          <label className="block text-sm font-semibold mb-3 dark:text-gray-200">
            Loại sim đặc biệt
          </label>
          <div className="grid grid-cols-2 gap-2">
            {simTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => handleCheckbox("simType", type.value)}
                className={`px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                  filters.simType.includes(type.value)
                    ? "bg-primary text-white border-primary"
                    : "bg-white dark:bg-dark border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Khoảng giá */}
        <div>
          <label className="block text-sm font-semibold mb-3 dark:text-gray-200">
            Khoảng giá
          </label>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleChange}
                placeholder="Từ"
                className="flex-1 bg-white dark:bg-dark border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-gray-500 dark:text-gray-400">-</span>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleChange}
                placeholder="Đến"
                className="flex-1 bg-white dark:bg-dark border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatPrice(filters.minPrice)} đ - {formatPrice(filters.maxPrice)} đ
            </div>
          </div>
        </div>

        {/* Số đặc biệt */}
        <div>
          <label className="block text-sm font-semibold mb-3 dark:text-gray-200">
            Tìm số đặc biệt (ngày sinh, kỷ niệm...)
          </label>
          <input
            type="text"
            name="specialNumbers"
            value={filters.specialNumbers}
            onChange={handleChange}
            placeholder="Vd: 0312, 1995, 2510"
            className="w-full bg-white dark:bg-dark border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Nhập các dãy số bạn muốn tìm trong sim
          </p>
        </div>

        {/* Ngày kỷ niệm */}
        <div>
          <label className="block text-sm font-semibold mb-3 dark:text-gray-200">
            Ngày kỷ niệm
          </label>
          <input
            type="date"
            name="anniversaryDate"
            value={filters.anniversaryDate}
            onChange={handleChange}
            className="w-full bg-white dark:bg-dark border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Tìm sim có chứa ngày/tháng này
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleReset}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Đặt lại
          </button>
          <button
            onClick={handleApply}
            className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-semibold transition shadow-lg shadow-primary/30"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}
