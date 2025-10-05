import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from './contexts/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'MoneyTracker - 家計簿アプリ',
  description: '収支を記録して家計を管理しよう',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors`}>
        {/* ダークモード切り替えやテーマ状態を提供 */}
        <ThemeProvider>
          <div className="min-h-screen">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
