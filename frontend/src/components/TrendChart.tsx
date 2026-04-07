// "use client";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// interface TrendChartProps {
//   data: Array<{ time: string; value: number; }>;
//   title: string;
//   color?: string;
// }

// export default function TrendChart({ data, title, color = "#6366f1" }: TrendChartProps) {
//   return (
//     <div className="bg-white rounded-xl p-4 shadow-sm border">
//       <h3 className="font-semibold text-gray-800 mb-3">{title}</h3>
//       <ResponsiveContainer width="100%" height={200}>
//         <LineChart data={data}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//           <XAxis dataKey="time" tick={{ fontSize: 11 }} />
//           <YAxis tick={{ fontSize: 11 }} />
//           <Tooltip />
//           <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// src/components/TrendChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Mon', views: 4000 }, { day: 'Tue', views: 3000 },
  { day: 'Wed', views: 5000 }, { day: 'Thu', views: 8000 },
  { day: 'Fri', views: 12000 }, { day: 'Sat', views: 15000 },
  { day: 'Sun', views: 18000 },
];

export default function TrendChart() {
  return (
    <div className="h-[300px] w-full bg-[#121212] p-4 rounded-xl border border-gray-800">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="day" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid #333'}} />
          <Line type="monotone" dataKey="views" stroke="#a855f7" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}