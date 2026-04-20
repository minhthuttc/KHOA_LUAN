import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'MINHTHUSIM - Gợi ý Sim Phong Thủy AI',
  description: 'Hệ thống gợi ý sim số đẹp ứng dụng trí tuệ nhân tạo, tối ưu phong thủy và điểm sở thích cá nhân',
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
