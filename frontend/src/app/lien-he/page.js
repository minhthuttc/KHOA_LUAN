"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.");
        setFormData({ name: "", phone: "", email: "", message: "" });
      } else {
        alert("Có lỗi xảy ra. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark">
      {/* Hero Section */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Liên Hệ Với Chúng Tôi</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info & Form */}
          <div className="space-y-8">
            {/* Contact Info Card - Combined */}
            <div className="bg-white dark:bg-dark-lighter rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-6 dark:text-white text-center">Thông tin liên hệ</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                    <Phone className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base dark:text-white mb-1">Điện thoại</h3>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">0382 286 177</p>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base dark:text-white mb-1">Email</h3>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold text-xs">nguyenthutv.220403@gmail.com</p>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base dark:text-white mb-1">Địa chỉ</h3>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold text-sm">
                      Nguyễn Thị Minh Khai, P7, TP. Trà Vinh
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white dark:bg-dark-lighter rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-6 dark:text-white">Gửi tin nhắn cho chúng tôi</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-gray-200">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-white dark:bg-dark border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-gray-200">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full bg-white dark:bg-dark border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-gray-200">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-dark border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                      placeholder="Nhập email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-gray-200">
                    Nội dung *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full bg-white dark:bg-dark border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary dark:text-white resize-none"
                    placeholder="Nhập nội dung tin nhắn..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-semibold transition shadow-lg shadow-primary/30 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "Đang gửi..." : (
                    <>
                      <Send className="w-5 h-5" />
                      Gửi tin nhắn
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Map */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white dark:bg-dark-lighter rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-primary" />
                  Vị trí cửa hàng
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Nguyễn Thị Minh Khai, Phường 7, TP. Trà Vinh
                </p>
              </div>
              
              {/* Google Maps Embed */}
              <div className="relative w-full h-[500px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.8!2d106.3417!3d9.9347!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0176f3e1e1e1f%3A0x1e1e1e1e1e1e1e1e!2sNguy%E1%BB%85n%20Th%E1%BB%8B%20Minh%20Khai%2C%20Ph%C6%B0%E1%BB%9Dng%207%2C%20Tr%C3%A0%20Vinh!5e0!3m2!1svi!2svn!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                ></iframe>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-800">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Nguyen+Thi+Minh+Khai+Phuong+7+Tra+Vinh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-primary hover:bg-primary-hover text-white text-center py-3 rounded-lg font-semibold transition"
                >
                  Xem trên Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
