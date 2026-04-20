import { Smartphone } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-gray-200 dark:border-gray-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Smartphone className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl tracking-tight">MINTHU<span className="text-primary">SIM</span></span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="font-medium hover:text-primary transition-colors">Trang chủ</a>
            <a href="#" className="font-medium hover:text-primary transition-colors">Kho số</a>
            <a href="#" className="font-medium hover:text-primary transition-colors">Định giá Sim</a>
            <a href="#" className="font-medium hover:text-primary transition-colors">Xem Phong Thủy</a>
            <a href="#" className="font-medium hover:text-primary transition-colors">Thu Mua Sim</a>
            <a href="#" className="font-medium hover:text-primary transition-colors">Xem Đại Cát</a>
            <a href="#" className="font-medium hover:text-primary transition-colors">Liên hệ</a>
          </nav>
          <div className="flex items-center">
            <button className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-full font-medium transition-transform transform hover:scale-105 shadow-lg shadow-primary/30">
              Tư vấn ngay
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
