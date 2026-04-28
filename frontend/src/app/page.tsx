import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden bg-gradient-mesh">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-accent-purple rounded-full mix-blend-multiply filter blur-[128px] opacity-20" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent-blue rounded-full mix-blend-multiply filter blur-[128px] opacity-20" />

      <div className="z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-bg-card/60 border border-border/60 backdrop-blur text-xs text-text-secondary">
          <Sparkles className="h-3 w-3 text-accent-purple" />
          AI-powered Music Intelligence
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-text-primary">
          Global Music <span className="gradient-text">Intelligence</span>
        </h1>

        <p className="text-lg md:text-xl text-text-secondary mb-10 leading-relaxed">
          Nền tảng phân tích dữ liệu âm nhạc theo thời gian thực. Theo dõi xu hướng, phân cụm thị hiếu toàn cầu và dự đoán Hit bằng Machine Learning.
        </p>

        <Link
          href="/briefing"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-gradient-aurora rounded-full shadow-glow hover:shadow-glow-blue hover:opacity-95"
        >
          Khám phá ngay
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
