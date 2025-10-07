import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from './contexts/ThemeContext'

/**
 * RootLayout は全ページ共通の HTML 構造を提供します。
 *  - Google Font (Inter) を読み込み、ボディに適用して統一されたタイポグラフィに。
 *  - `ThemeProvider` でライト／ダークテーマ切替をアプリ全体に展開します。
 * Next.js の App Router ではこのコンポーネントが全ページのルートになるため、
 * グローバルなラッパーを追加したい場合はここに追記します。
 */

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
        {/* Provide theme context including dark-mode toggling */}
        <ThemeProvider>
          <div className="min-h-screen">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
