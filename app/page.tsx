import Link from 'next/link';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">MoneyTracker</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/login"
                className="text-gray-500 hover:text-gray-700 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium touch-manipulation"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium touch-manipulation"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-10 rounded-full text-sm font-medium text-blue-100 backdrop-blur-sm">
                <span className="mr-2">✨</span>
                日本で最も使いやすい家計簿アプリ
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 sm:mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                お金の管理を
              </span>
              <br />
              <span className="text-white">もっとスマートに</span>
            </h1>
            
            <p className="text-xl sm:text-2xl md:text-3xl mb-8 sm:mb-12 text-blue-100 max-w-4xl mx-auto px-4 leading-relaxed">
              MoneyTrackerで家計を見える化し、<br className="hidden sm:block" />
              理想の未来を手に入れましょう
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4 mb-12">
              <Link
                href="/register"
                className="group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl text-lg sm:text-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center justify-center touch-manipulation shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1"
              >
                無料で始める
                <ArrowRightIcon className="ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="border-2 border-white text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl text-lg sm:text-xl font-bold hover:bg-white hover:text-blue-900 transition-all duration-300 touch-manipulation backdrop-blur-sm"
              >
                ログイン
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">10万+</div>
                <div className="text-blue-200 text-sm sm:text-base">利用者数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">4.8★</div>
                <div className="text-blue-200 text-sm sm:text-base">満足度</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">無料</div>
                <div className="text-blue-200 text-sm sm:text-base">基本機能</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-sm font-medium text-blue-800 mb-6">
              <span className="mr-2">🚀</span>
              充実の機能
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              家計管理に必要な
              <span className="block text-blue-600">すべてが揃っています</span>
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto px-4">
              シンプルで直感的な操作で、誰でも簡単に家計を管理できます
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            <div className="group bg-white p-8 sm:p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 touch-manipulation border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">スマート分析</h3>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                AIが支出パターンを分析し、無駄遣いを発見。美しいグラフで家計の状況を一目で把握できます。
              </p>
            </div>

            <div className="group bg-white p-8 sm:p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 touch-manipulation border border-gray-100 hover:border-green-200 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CurrencyDollarIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">簡単記録</h3>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                カレンダーをタップするだけで収支を記録。カテゴリ分けも自動で、面倒な入力作業は不要です。
              </p>
            </div>

            <div className="group bg-white p-8 sm:p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 touch-manipulation border border-gray-100 hover:border-purple-200 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheckIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">安心セキュリティ</h3>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                銀行レベルの暗号化でデータを保護。プライバシーを最優先に、安全に家計管理ができます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-28 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium text-white backdrop-blur-sm mb-6">
              <span className="mr-2">🎯</span>
              今すぐ始めよう
            </div>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 sm:mb-8 px-4 leading-tight">
            あなたの理想の家計を
            <span className="block text-blue-200">実現しませんか？</span>
          </h2>
          
          <p className="text-xl sm:text-2xl text-blue-100 mb-10 sm:mb-12 max-w-3xl mx-auto px-4 leading-relaxed">
            すでに10万人以上の方がMoneyTrackerで<br className="hidden sm:block" />
            家計管理を成功させています
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
            <Link
              href="/register"
              className="group bg-white text-blue-600 px-10 sm:px-12 py-4 sm:py-5 rounded-xl text-lg sm:text-xl font-bold hover:bg-gray-50 transition-all duration-300 inline-flex items-center justify-center touch-manipulation shadow-2xl transform hover:-translate-y-1"
            >
              今すぐ無料で始める
              <ArrowRightIcon className="ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="border-2 border-white text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl text-lg sm:text-xl font-bold hover:bg-white hover:text-blue-600 transition-all duration-300 touch-manipulation backdrop-blur-sm"
            >
              既にアカウントをお持ちの方
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <CurrencyDollarIcon className="h-8 w-8 sm:h-10 sm:w-10 text-blue-400 mr-3" />
              <span className="text-2xl sm:text-3xl font-bold">MoneyTracker</span>
            </div>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
              日本で最も使いやすい家計簿アプリで、あなたの理想の未来を実現しましょう
            </p>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2025 MoneyTracker. すべての権利を保有しています。
              </div>
              <div className="flex space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">プライバシーポリシー</a>
                <a href="#" className="hover:text-white transition-colors">利用規約</a>
                <a href="#" className="hover:text-white transition-colors">お問い合わせ</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}