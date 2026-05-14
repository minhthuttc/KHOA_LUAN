"use client";

import { useState } from "react";
import { Sparkles, CheckCircle2, ChevronRight, X, CreditCard, User, Phone, MapPin } from "lucide-react";
import axios from "axios";

export default function SimCard({ sim }) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    paymentMethod: "bank_transfer"
  });
  const [loading, setLoading] = useState(false);

  // Extract data from backend response
  const { 
    sim_number, 
    network, 
    price, 
    category, 
    description,
    suitabilityScore, 
    explainableAI,
    fengShuiPoint,
    interestPoint
  } = sim;

  // Format phone number (e.g. 098 123 4567)
  const formatPhone = (num) => {
    return num.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  };

  // Format price
  const formatPrice = (p) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
  };

  // Determine network color
  const getNetworkBg = (net) => {
    if (net.toLowerCase() === 'viettel') return 'bg-red-500';
    if (net.toLowerCase() === 'vinaphone') return 'bg-blue-500';
    if (net.toLowerCase() === 'mobifone') return 'bg-red-600';
    return 'bg-gray-500';
  };

  const handleOpenModal = () => {
    // Lấy thông tin user từ localStorage
    const userData = localStorage.getItem("user");
    if (!userData) {
      alert("Vui lòng đăng nhập để mua sim!");
      window.location.href = "/login";
      return;
    }

    const user = JSON.parse(userData);
    // Chỉ tự động điền tên, số điện thoại và địa chỉ để trống
    setPurchaseForm({
      fullName: user.name,
      phone: "",
      address: "",
      paymentMethod: "bank_transfer"
    });
    setShowPurchaseModal(true);
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    
    // Kiểm tra đăng nhập
    const userData = localStorage.getItem("user");
    if (!userData) {
      alert("Vui lòng đăng nhập để mua sim!");
      window.location.href = "/login";
      return;
    }

    const user = JSON.parse(userData);
    setLoading(true);

    try {
      // Lưu lịch sử mua hàng
      await axios.post("http://localhost:5000/api/purchase", {
        user_id: user.id,
        user_name: user.name,
        sim_number,
        network,
        price,
        category,
        customer_name: purchaseForm.fullName,
        customer_phone: purchaseForm.phone,
        customer_address: purchaseForm.address,
        payment_method: purchaseForm.paymentMethod
      });

      alert(`Đặt mua sim ${sim_number} thành công!\n\nThông tin:\n- Họ tên: ${purchaseForm.fullName}\n- SĐT: ${purchaseForm.phone}\n- Địa chỉ: ${purchaseForm.address}\n- Thanh toán: ${purchaseForm.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : 'COD'}\n\nChúng tôi sẽ liên hệ với bạn sớm!`);
      
      setShowPurchaseModal(false);
      setPurchaseForm({
        fullName: "",
        phone: "",
        address: "",
        paymentMethod: "bank_transfer"
      });
      
      // Reload trang để cập nhật danh sách sim
      window.location.reload();
    } catch (error) {
      console.error("Purchase error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Có lỗi xảy ra. Vui lòng thử lại!";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="group bg-white dark:bg-dark-lighter rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 relative overflow-hidden flex flex-col h-full">
      
      {/* Network Badge & Match Score Badge */}
      <div className="flex justify-between items-start mb-6 z-10 w-full">
        <span className={`${getNetworkBg(network)} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>
          {network}
        </span>
        
        <div className="flex bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-primary px-3 py-1 rounded-full font-bold items-center gap-1 shadow-sm border border-amber-100 dark:border-amber-900/50">
          <Sparkles className="w-4 h-4" />
          <span>S: {suitabilityScore}</span>
        </div>
      </div>

      {/* Main SIM Number */}
      <div className="text-center my-4 z-10">
        <h3 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-[0.1em] text-gradient whitespace-nowrap">
          {formatPhone(sim_number)}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 text-sm">{category}</p>
      </div>

      {/* Price */}
      <div className="text-center mb-6 z-10">
        <p className="text-xl font-bold text-red-500 dark:text-red-400">
          {formatPrice(price)}
        </p>
      </div>

      <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-4 z-10"></div>

      {/* Description block */}
      <div className="flex-grow z-10 min-h-[100px]">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
           Chi tiết về sim:
        </h4>
        {description ? (
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4">
            {description}
          </p>
        ) : explainableAI && explainableAI.length > 0 ? (
          <ul className="space-y-2">
            {explainableAI.slice(0, 3).map((reason, idx) => (
              <li key={idx} className="flex items-start text-sm text-gray-600 dark:text-gray-400 gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span className="line-clamp-2">{reason}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-500 italic">
            Sim đẹp, giá tốt, phù hợp cho mọi nhu cầu sử dụng.
          </p>
        )}
      </div>

      {/* CTA Button */}
      <button 
        onClick={handleOpenModal}
        className="w-full mt-6 bg-dark hover:bg-black dark:bg-primary dark:hover:bg-primary-hover dark:text-white text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 z-10"
      >
        Mua Ngay <ChevronRight className="w-4 h-4"/>
      </button>

      {/* Subtle background decoration */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none"></div>
    </div>

    {/* Purchase Modal */}
    {showPurchaseModal && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-dark-lighter rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-dark-lighter border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold dark:text-white">Thông tin mua sim</h2>
            <button
              onClick={() => setShowPurchaseModal(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Sim Info */}
            <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`${getNetworkBg(network)} text-white text-xs font-bold px-3 py-1 rounded-full uppercase`}>
                  {network}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{category}</span>
              </div>
              <h3 className="text-3xl font-bold text-center mb-2 tracking-wider">
                {formatPhone(sim_number)}
              </h3>
              <p className="text-3xl font-bold text-red-500 text-center">
                {formatPrice(price)}
              </p>
            </div>

            {/* Purchase Form */}
            <form onSubmit={handlePurchase} className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2 dark:text-gray-200">
                  <User className="w-4 h-4" />
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={purchaseForm.fullName}
                  onChange={(e) => setPurchaseForm({...purchaseForm, fullName: e.target.value})}
                  required
                  className="w-full bg-white dark:bg-dark border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2 dark:text-gray-200">
                  <Phone className="w-4 h-4" />
                  Số điện thoại liên hệ
                </label>
                <input
                  type="tel"
                  value={purchaseForm.phone}
                  onChange={(e) => setPurchaseForm({...purchaseForm, phone: e.target.value})}
                  required
                  className="w-full bg-white dark:bg-dark border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2 dark:text-gray-200">
                  <MapPin className="w-4 h-4" />
                  Địa chỉ nhận sim
                </label>
                <textarea
                  value={purchaseForm.address}
                  onChange={(e) => setPurchaseForm({...purchaseForm, address: e.target.value})}
                  required
                  rows="3"
                  className="w-full bg-white dark:bg-dark border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                  placeholder="Nhập địa chỉ nhận sim"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2 dark:text-gray-200">
                  <CreditCard className="w-4 h-4" />
                  Phương thức thanh toán
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPurchaseForm({...purchaseForm, paymentMethod: 'bank_transfer'})}
                    className={`p-4 rounded-lg border-2 transition ${
                      purchaseForm.paymentMethod === 'bank_transfer'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-300 dark:border-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <div className="font-semibold">Chuyển khoản</div>
                    <div className="text-xs mt-1">Ngân hàng</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPurchaseForm({...purchaseForm, paymentMethod: 'cod'})}
                    className={`p-4 rounded-lg border-2 transition ${
                      purchaseForm.paymentMethod === 'cod'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-300 dark:border-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <div className="font-semibold">COD</div>
                    <div className="text-xs mt-1">Thanh toán khi nhận</div>
                  </button>
                </div>
              </div>

              {purchaseForm.paymentMethod === 'bank_transfer' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 dark:text-white">Thông tin chuyển khoản:</h4>
                  <div className="space-y-1 text-sm dark:text-gray-300">
                    <p><strong>Ngân hàng:</strong> Vietcombank</p>
                    <p><strong>Số tài khoản:</strong> 1025311193</p>
                    <p><strong>Chủ tài khoản:</strong> MINH THU SIM</p>
                    <p><strong>Nội dung:</strong> MUA SỐ: {sim_number}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {loading ? "Đang xử lý..." : "Xác nhận mua"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
