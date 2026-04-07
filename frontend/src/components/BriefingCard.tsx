import SourceBadge from "./SourceBadge";
import type { DailyBriefing } from "@/types";
import ReactMarkdown from "react-markdown"; // 👈 Thêm import này

interface BriefingCardProps {
  briefing: DailyBriefing;
  onRefresh?: () => void;
  loading?: boolean;
}

export default function BriefingCard({ briefing, onRefresh, loading }: BriefingCardProps) {
  const date = new Date(briefing.generated_at).toLocaleString("vi-VN");

  return (
    <div className="bg-gradient-to-br from-slate-800 to-indigo-900 rounded-xl p-6 text-white shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">🤖 AI Daily Briefing</h2>
          <p className="text-indigo-300 text-xs mt-0.5">
            {briefing.cached ? "📦 Cached · " : "🔄 Fresh · "}
            {date}
          </p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 
                       text-white text-xs font-medium px-3 py-1.5 rounded-lg 
                       transition-colors disabled:opacity-50"
          >
            {loading ? "⏳" : "🔄"} Refresh
          </button>
        )}
      </div>

      {/* Briefing content - ĐÃ ĐƯỢC NÂNG CẤP BẰNG MARKDOWN */}
      <div className="text-sm leading-relaxed text-indigo-100 mb-6">
        <ReactMarkdown
          components={{
            // Ép Tailwind phải tô đậm và làm sáng màu các chữ có dấu **...**
            strong: ({node, ...props}) => <span className="font-bold text-white" {...props} />,
            // Tạo khoảng cách giữa các đoạn văn
            p: ({node, ...props}) => <p className="mb-4" {...props} />,
            // Trả lại dấu chấm tròn cho danh sách và thụt lề
            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-2" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-2" {...props} />,
            // Làm nổi bật các tiêu đề 1, 2, 3 do AI tạo ra
            h1: ({node, ...props}) => <h1 className="text-xl font-bold text-white mb-3 mt-6" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-lg font-bold text-white mb-2 mt-5 border-b border-white/10 pb-1" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-base font-bold text-white mb-2 mt-4" {...props} />,
          }}
        >
          {briefing.briefing}
        </ReactMarkdown>
      </div>

      {/* Sources */}
      <div className="pt-4 border-t border-white/10">
        <p className="text-xs text-indigo-400 mb-2">Nguồn dữ liệu:</p>
        <div className="flex flex-wrap gap-1.5">
          {briefing.sources.map((source, idx) => (
            <a
              key={source}
              href={briefing.source_urls?.[idx]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-white/10 hover:bg-white/20 text-indigo-200 
                         px-2 py-0.5 rounded border border-white/10 transition-colors"
            >
              {source}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}