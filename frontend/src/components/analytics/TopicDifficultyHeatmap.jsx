import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function TopicDifficultyHeatmap({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-400">
        No topic data available
      </div>
    )
  }

  // Determine color based on average score (lower score = red/difficult, higher = green/easy)
  const getColor = (score) => {
    if (score < 40) return '#ef4444'; // Red for difficult (low avg score)
    if (score < 70) return '#f59e0b'; // Amber for medium
    return '#10b981'; // Green for easy (high avg score)
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
       const data = payload[0].payload;
       return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm">
          <p className="font-semibold text-slate-700">{data.topic}</p>
          <p className="text-slate-600">Class Average: {data.averageScore}%</p>
          <p className="text-xs text-slate-400 mt-1">
            {data.averageScore < 40 ? 'High Difficulty' : data.averageScore < 70 ? 'Moderate Difficulty' : 'Low Difficulty'}
          </p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 5,
            right: 30,
            left: 40,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="topic" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
          <Bar dataKey="averageScore" radius={[0, 4, 4, 0]} barSize={24}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.averageScore)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
