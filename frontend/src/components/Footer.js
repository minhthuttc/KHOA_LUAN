import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto bg-dark text-gray-300 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <span className="font-bold text-2xl tracking-tight text-white mb-4 block">
              AI<span className="text-primary">Sim</span>
            </span>
            <p className="text-sm text-gray-400 mb-4">
              Hệ thống tư vấn sim số đẹp ứng dụng trí tuệ nhân tạo, tối ưu phong thủy và điểm sở thích cá nhân.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Liên kết</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary transition">Về chúng tôi</a></li>
              <li><a href="#" className="hover:text-primary transition">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-primary transition">Điều khoản dịch vụ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary transition">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="hover:text-primary transition">Hướng dẫn mua sim</a></li>
              <li><a href="#" className="hover:text-primary transition">Tra cứu đơn hàng</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary"/> 123 Đường Số 1, TP. HCM</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary"/> 1900 1234</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary"/> hotro@aisim.vn</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} AISim. Xây dựng bởi Minh Thu.</p>
        </div>
      </div>
    </footer>
  );
}
