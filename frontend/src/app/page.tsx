import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0c0d0f] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      {/* Background hiệu ứng */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>

      <div className="z-10 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
          Global Music <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Intelligence</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
          Nền tảng phân tích dữ liệu âm nhạc theo thời gian thực. Theo dõi xu hướng, phân cụm thị hiếu toàn cầu và dự đoán Hit bằng Machine Learning.
        </p>

        <Link 
          href="/dashboard"
          className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-purple-600 border border-transparent rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.4)]"
        >
          Get Started: Free
        </Link>
        
        <div className="mt-12 text-sm text-gray-500 font-medium">
        </div>
      </div>
    </div>
  );
}