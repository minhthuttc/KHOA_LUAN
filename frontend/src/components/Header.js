import Link from "next/link";

export default function Header() {
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
