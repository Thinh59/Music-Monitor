// interface SourceBadgeProps {
//   source: string;
//   sourceUrl?: string;
// }

// const SOURCE_COLORS: Record<string, string> = {
//   "Last.fm": "bg-red-100 text-red-700 border-red-200",
//   "YouTube": "bg-red-50 text-red-600 border-red-100",
//   "Reddit": "bg-orange-100 text-orange-700 border-orange-200",
//   "MusicBrainz": "bg-blue-100 text-blue-700 border-blue-200",
//   "Spotify": "bg-green-100 text-green-700 border-green-200",
// };

// export default function SourceBadge({ source, sourceUrl }: SourceBadgeProps) {
//   const colorClass = SOURCE_COLORS[source] || "bg-gray-100 text-gray-600 border-gray-200";
  
//   return (
//     <a
//       href={sourceUrl}
//       target="_blank"
//       rel="noopener noreferrer"
//       className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorClass} hover:opacity-80 transition-opacity`}
//     >
//       📊 {source}
//     </a>
//   );
// }

interface SourceBadgeProps {
  source: string;
  sourceUrl?: string;
}

const SOURCE_COLORS: Record<string, string> = {
  "Last.fm": "bg-red-500/10 text-red-400 border-red-500/20",
  "YouTube": "bg-red-500/10 text-red-500 border-red-500/20",
  "Reddit": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "MusicBrainz": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Spotify": "bg-green-500/10 text-green-400 border-green-500/20",
};

export default function SourceBadge({ source, sourceUrl }: SourceBadgeProps) {
  const colorClass = SOURCE_COLORS[source] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
  
  return (
    <a
      href={sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${colorClass} hover:bg-opacity-20 transition-all`}
    >
      {source}
    </a>
  );
}