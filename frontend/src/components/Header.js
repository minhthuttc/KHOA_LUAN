import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-dark border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <svg width="32" height="44" viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="5" width="80" height="140" rx="12" fill="currentColor" className="text-primary"/>
              <rect x="30" y="15" width="40" height="8" rx="4" fill="white"/>
              <rect x="20" y="30" width="60" height="95" rx="2" fill="white"/>
              <circle cx="50" cy="135" r="8" fill="white"/>
            </svg>
            <span className="font-bold text-xl tracking-tight">MINHTHUSIM</span>
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="font-medium hover:text-primary transition-colors">Trang chủ</Link>
            <Link href="/kho-so" className="font-medium hover:text-primary transition-colors">Kho số</Link>
            <a href="#" className="font-medium hover:text-primary transition-colors">Định giá Sim</a>
            <a href="#" className="font-medium hover:text-primary transition-colors">Xem Phong Thủy</a>
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
