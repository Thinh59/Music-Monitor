import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface ViralRadarChartProps {
  trackName: string;
  artistName: string;
}

export default function ViralRadarChart({ trackName, artistName }: ViralRadarChartProps) {
  // Sinh số liệu giả lập cố định dựa trên tên bài hát (để minh họa ý tưởng 3)
  const getScore = (salt: number) => {
    const str = trackName + artistName;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return 65 + (Math.abs(hash * salt) % 35); // Điểm từ 65 đến 100
  };

  const data = [
    { subject: 'Memeability', score: getScore(1), fullMark: 100 },
    { subject: 'Emotional Hook', score: getScore(2), fullMark: 100 },
    { subject: 'Danceability', score: getScore(3), fullMark: 100 },
    { subject: 'Lyrics', score: getScore(4), fullMark: 100 },
    { subject: 'Shock Value', score: getScore(5), fullMark: 100 },
  ];

  return (
    <div className="w-full h-56 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="AI Score"
            dataKey="score"
            stroke="#a855f7"
            strokeWidth={2}
            fill="#a855f7"
            fillOpacity={0.35}
          />
          <Tooltip 
            formatter={(value: number) => [`${value}/100`, 'Điểm AI']}
            contentStyle={{ 
              backgroundColor: '#1e1e2f', 
              border: '1px solid #334155', 
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
